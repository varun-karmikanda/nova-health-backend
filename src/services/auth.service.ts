import { randomUUID } from 'node:crypto';

import bcrypt from 'bcryptjs';

import {
  CreateUserInput,
  SignInInput,
  SignInResponse,
  User,
} from '../models/auth.dto';
import { UserRepository } from '../repositories/user.repository';
import { ConflictError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { generateToken, verifyToken } from '../utils/token.utils';

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
    const hashedPassword = await bcrypt.hash(input.password, 10);

    const newUser = await this.userRepository.create({
      id: randomUUID(),
      first_name: input.first_name,
      last_name: input.last_name,
      gender: input.gender,
      email: input.email.toLowerCase(),
      phone: input.phone,
      role: input.role,
      salary: input.salary,
      password_hash: hashedPassword,
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

    const isMatch = await bcrypt.compare(input.password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateToken(tokenPayload, 900); // 900 seconds
    const refreshToken = generateToken(tokenPayload, 15 * 24 * 3600); // 15 days

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.updateRefreshTokenHash(user.id, refreshTokenHash);

    await this.auditService.logAction(
      'LOGIN',
      'User',
      user.id,
      user.id,
    );

    return {
      accessToken,
      refreshToken,
      userId: user.id,
    };
  }

  public async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = verifyToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findByIdWithSecrets(payload.id);
    if (!user) {
      throw new UnauthorizedError('User not found or inactive');
    }

    if (!user.refresh_token_hash) {
      throw new UnauthorizedError('Session has been revoked or expired');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refresh_token_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const newAccessToken = generateToken(tokenPayload, 900);
    const newRefreshToken = generateToken(tokenPayload, 15 * 24 * 3600);

    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    await this.userRepository.updateRefreshTokenHash(user.id, newRefreshTokenHash);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
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

  public async getAllUsers(includeDeactivated: boolean = false): Promise<User[]> {
    return this.userRepository.findAll(includeDeactivated);
  }

  public async removeUser(id: string, operatorId: string): Promise<void> {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('User', id);
    }

    await this.userRepository.softDelete(id);
    await this.userRepository.updateRefreshTokenHash(id, null);

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
