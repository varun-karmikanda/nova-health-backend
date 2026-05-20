import { User } from '../models/auth.dto';

export class UserRepository {
  // In-memory data store mimicking a database table
  private static users: Array<User & { passwordHash: string }> = [];

  public findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const user = UserRepository.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return Promise.resolve(user ?? null);
  }

  public findById(id: string): Promise<User | null> {
    const user = UserRepository.users.find((u) => u.id === id);
    if (!user) return Promise.resolve(null);
    const { passwordHash: _, ...userWithoutPassword } = user;
    return Promise.resolve(userWithoutPassword);
  }

  public create(user: User & { passwordHash: string }): Promise<User> {
    UserRepository.users.push(user);
    const { passwordHash: _, ...userWithoutPassword } = user;
    return Promise.resolve(userWithoutPassword);
  }
}
