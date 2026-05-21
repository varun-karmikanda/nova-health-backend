import { UserModel } from '../models/user.schema';
import { User } from '../models/auth.dto';

export class UserRepository {
  // Find a user by email (including password hash)
  public async findByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase(), is_active: { $ne: false } }).lean();
    if (!user) return null;
    const { _id, ...rest } = user;
    return { id: _id, ...rest } as any;
  }

  // Find a user by ID (excluding password hash)
  public async findById(id: string): Promise<User | null> {
    const user = await UserModel.findOne({ _id: id, is_active: { $ne: false } }).select('-password_hash -__v').lean();
    if (!user) return null;
    const { _id, ...rest } = user;
    return { id: _id, ...rest } as any;
  }

  // Create a new user (expects password_hash field already set)
  public async create(user: User & { password_hash: string }): Promise<User> {
    const created = await UserModel.create({
      _id: user.id,
      is_active: true,
      ...user,
    } as any);
    const { _id, password_hash: _passwordHash, ...rest } = created.toObject();
    return { id: _id, ...rest } as any;
  }

  // Find all users with doctor role
  public async findDoctors(): Promise<User[]> {
    const doctors = await UserModel.find({ role: 'doctor', is_active: { $ne: false } })
      .select('-password_hash -__v')
      .lean();
    return doctors.map((user) => {
      const { _id, ...rest } = user;
      return { id: _id, ...rest } as any;
    });
  }

  // Find all active users
  public async findAll(): Promise<User[]> {
    const users = await UserModel.find({ is_active: { $ne: false } }).select('-password_hash -__v').lean();
    return users.map((user) => {
      const { _id, ...rest } = user;
      return { id: _id, ...rest } as any;
    });
  }

  // Soft delete a user
  public async softDelete(id: string): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: id },
      { is_active: false, updated_at: new Date().toISOString() },
    );
    return result.modifiedCount > 0;
  }
}
