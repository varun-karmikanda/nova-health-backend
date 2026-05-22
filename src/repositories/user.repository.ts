import { UserModel } from '../models/user.schema';
import { User } from '../models/auth.dto';

export class UserRepository {
  // Find a user by email (including password hash and refresh token hash)
  public async findByEmail(
    email: string,
  ): Promise<
    | (User & { password_hash: string; refresh_token_hash?: string })
    | null
  > {
    const user = await UserModel.findOne({ email: email.toLowerCase(), is_active: { $ne: false } }).lean();
    if (!user) return null;
    const { _id, ...rest } = user;
    return { id: _id, ...rest } as User & { password_hash: string; refresh_token_hash?: string };
  }

  // Find a user by ID (excluding password hash and refresh token hash)
  public async findById(id: string): Promise<User | null> {
    const user = await UserModel.findOne({ _id: id, is_active: { $ne: false } })
      .select('-password_hash -refresh_token_hash -__v')
      .lean();
    if (!user) return null;
    const { _id, ...rest } = user;
    return { id: _id, ...rest } as User;
  }

  // Find a user by ID including secrets for authentication flows
  public async findByIdWithSecrets(
    id: string,
  ): Promise<
    | (User & { password_hash: string; refresh_token_hash?: string })
    | null
  > {
    const user = await UserModel.findOne({ _id: id, is_active: { $ne: false } }).lean();
    if (!user) return null;
    const { _id, ...rest } = user;
    return { id: _id, ...rest } as User & { password_hash: string; refresh_token_hash?: string };
  }

  // Update a user's refresh token hash
  public async updateRefreshTokenHash(id: string, hash: string | null): Promise<void> {
    await UserModel.updateOne({ _id: id }, { refresh_token_hash: hash ?? undefined });
  }

  // Create a new user (expects password_hash field already set)
  public async create(user: User & { password_hash: string }): Promise<User> {
    const { id, ...userData } = user;
    const created = await UserModel.create({
      _id: id,
      is_active: true,
      ...userData,
    });
    const { _id, password_hash: _passwordHash, ...rest } = created.toObject();
    return { id: _id, ...rest } as User;
  }

  // Find all users with doctor role
  public async findDoctors(): Promise<User[]> {
    const doctors = await UserModel.find({ role: 'doctor', is_active: { $ne: false } })
      .select('-password_hash -__v')
      .lean();
    return doctors.map((user) => {
      const { _id, ...rest } = user;
      return { id: _id, ...rest } as User;
    });
  }

  // Find all users (optionally including deactivated ones)
  public async findAll(includeDeactivated: boolean = false): Promise<User[]> {
    const query = includeDeactivated ? {} : { is_active: { $ne: false } };
    const users = await UserModel.find(query).select('-password_hash -__v').lean();
    return users.map((user) => {
      const { _id, ...rest } = user;
      return { id: _id, ...rest } as User;
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
