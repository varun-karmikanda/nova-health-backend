import { randomUUID } from 'node:crypto';

import { UserRepository } from '../repositories/user.repository';
import {
  CreateUserInput,
  SignInInput,
  SignInResponse,
  User,
} from '../models/auth.dto';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';

import { AuditService } from './audit.service';

export class AuthService {
  private userRepository = new UserRepository();

  private auditService = new AuditService();

  public async register(input: CreateUserInput, operatorId?: string): Promise<User> {
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

    await this.auditService.logAction(
      'CREATE',
      'User',
      newUser.id,
      operatorId ?? newUser.id,
      undefined,
      null,
      newUser as unknown as Record<string, unknown>,
    );

    return newUser;
  }

  public async login(input: SignInInput): Promise<SignInResponse> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const expectedHash = `hash_${input.password}`;
    if (user.password_hash !== expectedHash) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    await this.auditService.logAction(
      'LOGIN',
      'User',
      user.id,
      user.id,
    );

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

  public async getDoctors(): Promise<User[]> {
    return this.userRepository.findDoctors();
  }

  public async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  public async removeUser(id: string, operatorId: string): Promise<void> {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('User', id);
    }

    await this.userRepository.softDelete(id);

    await this.auditService.logAction(
      'DELETE',
      'User',
      id,
      operatorId,
      undefined,
      existing as unknown as Record<string, unknown>,
      null,
    );
  }
}
