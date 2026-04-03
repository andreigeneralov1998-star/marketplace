import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordByIdentityDto } from './dto/reset-password-by-identity.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private normalizeUsername(value: string) {
    return value.trim().toLowerCase();
  }

  private normalizeEmail(value: string) {
    return value.trim().toLowerCase();
  }

  private normalizePhone(value: string) {
    const digitsOnly = value.replace(/\D/g, '');

    if (digitsOnly.startsWith('80') && digitsOnly.length === 11) {
      return `375${digitsOnly.slice(2)}`;
    }

    if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
      return `375${digitsOnly.slice(1)}`;
    }

    if (digitsOnly.startsWith('375')) {
      return digitsOnly;
    }

    return digitsOnly;
  }

  async register(dto: RegisterDto) {
    const email = this.normalizeEmail(dto.email);
    const username = this.normalizeUsername(dto.username);
    const fullName = dto.fullName.trim();
    const phone = this.normalizePhone(dto.phone);

    const existsByEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existsByEmail) {
      throw new BadRequestException('Email already registered');
    }

    const existsByUsername = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existsByUsername) {
      throw new BadRequestException('Username already taken');
    }

    const userWithSamePhone = await this.prisma.user.findFirst({
      where: { phone },
      select: { id: true },
    });

    if (userWithSamePhone) {
      throw new BadRequestException('Телефон уже используется');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        fullName,
        phone,
        passwordHash,
        role: 'BUYER',
      },
    });

    return this.issueTokens(user.id, user.email, user.role, user.username);
  }

  async login(dto: LoginDto) {
    const username = this.normalizeUsername(dto.username);

    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user.id, user.email, user.role, user.username);
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isSellerApproved: true,
      },
    });
  }

  async resetPasswordByIdentity(dto: ResetPasswordByIdentityDto) {
    const normalizedUsername = this.normalizeUsername(dto.username);
    const normalizedEmail = this.normalizeEmail(dto.email);
    const normalizedPhone = this.normalizePhone(dto.phone);

    const user = await this.prisma.user.findFirst({
      where: {
        username: normalizedUsername,
        email: normalizedEmail,
        phone: normalizedPhone,
      },
    });

    if (!user) {
      throw new BadRequestException('Пользователь с такими данными не найден');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { message: 'Пароль успешно изменён' };
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: string,
    username: string,
  ) {
    const payload = { sub: userId, email, role, username };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }
}