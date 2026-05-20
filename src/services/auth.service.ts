import { UserRepository } from '../repositories/user.repository';
import { RegisterInput, LoginInput, AuthResponse, User } from '../models/auth.dto';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';

export class AuthService {
  private userRepository = new UserRepository();

  public async register(input: RegisterInput): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('User', `email '${input.email}'`);
    }

    // In a real application, we would use bcrypt or argon2 to hash the password
    const mockPasswordHash = `hash_${input.password}`;

    const newUser = await this.userRepository.create({
      id: Math.random().toString(36).substring(2, 11),
      email: input.email.toLowerCase(),
      name: input.name,
      role: input.role,
      passwordHash: mockPasswordHash,
      createdAt: new Date().toISOString(),
    });

    return newUser;
  }

  public async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const expectedHash = `hash_${input.password}`;
    if (user.passwordHash !== expectedHash) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate a simple base64-encoded mock JWT token containing user details
    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  public async getCurrentUser(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }
    return user;
  }
}
