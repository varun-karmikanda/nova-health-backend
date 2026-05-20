import { randomUUID } from 'node:crypto';

import { UserRepository } from '../repositories/user.repository';
import {
  CreateUserInput,
  SignInInput,
  SignInResponse,
  User,
} from '../models/auth.dto';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';

export class AuthService {
  private userRepository = new UserRepository();

  public async register(input: CreateUserInput): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('User', `email '${input.email}'`);
    }

    const now = new Date().toISOString();
    const mockPasswordHash = `hash_${input.password}`;

    const newUser = await this.userRepository.create({
      id: randomUUID(),
      first_name: input.first_name,
      last_name: input.last_name,
      gender: input.gender,
      email: input.email.toLowerCase(),
      phone: input.phone,
      role: input.role,
      salary: input.salary,
      password_hash: mockPasswordHash,
      created_at: now,
      updated_at: now,
    });

    return newUser;
  }

  public async login(input: SignInInput): Promise<SignInResponse> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify role matches
    if (user.role !== input.role) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const expectedHash = `hash_${input.password}`;
    if (user.password_hash !== expectedHash) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    return {
      accessToken,
      userId: user.id,
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
