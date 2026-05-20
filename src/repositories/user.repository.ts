import { User } from '../models/auth.dto';

export class UserRepository {
  private static users: Array<User & { password_hash: string }> = [];

  public findByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
    const user = UserRepository.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    return Promise.resolve(user ?? null);
  }

  public findById(id: string): Promise<User | null> {
    const record = UserRepository.users.find((u) => u.id === id);
    if (!record) return Promise.resolve(null);
    const { password_hash: _, ...user } = record;
    return Promise.resolve(user);
  }

  public create(user: User & { password_hash: string }): Promise<User> {
    UserRepository.users.push(user);
    const { password_hash: _, ...created } = user;
    return Promise.resolve(created);
  }
}
