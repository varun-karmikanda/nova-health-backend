import { UserModel } from '../models/user.schema';
import { User } from '../models/auth.dto';

export class UserRepository {
  // Find a user by email (including password hash)
  public async findByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    if (!user) return null;
    const { _id, ...rest } = user;
    return { id: _id, ...rest } as any;
  }

  // Find a user by ID (excluding password hash)
  public async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id).select('-password_hash -__v').lean();
    if (!user) return null;
    const { _id, ...rest } = user;
    return { id: _id, ...rest } as any;
  }

  // Create a new user (expects password_hash field already set)
  public async create(user: User & { password_hash: string }): Promise<User> {
    const created = await UserModel.create({
      _id: user.id,
      ...user,
    } as any);
    const { _id, password_hash, ...rest } = created.toObject();
    return { id: _id, ...rest } as any;
  }
}
