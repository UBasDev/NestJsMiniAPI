import { PrismaService } from './../prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt/dist';
import { ForbiddenException } from '@nestjs/common/exceptions';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly JwtService: JwtService,
    private readonly logger: Logger,
  ) {}
  async signUp(requestBody: AuthDto): Promise<Tokens> {
    const hash = await this.hashData(requestBody.password);
    const newUser = await this.prismaService.user.create({
      data: {
        email: requestBody.email,
        hash,
      },
    });
    const tokens = await this.getToken(newUser.id, newUser.email);
    await this.updateRefreshTokenHash(newUser.id, tokens.refresh_token);
    return tokens;
  }

  async signIn(requestBody: AuthDto): Promise<Tokens> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: requestBody.email,
      },
    });
    if (!user) throw new ForbiddenException('Access Denied!');
    const passwordMatches = await argon.verify(user.hash, requestBody.password);
    if (!passwordMatches) throw new ForbiddenException('Access Denied!');
    const tokens = await this.getToken(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    this.logger.log('test');
    return tokens;
  }

  async logout(userId: number): Promise<void> {
    await this.prismaService.user.updateMany({
      where: {
        id: userId,
        hashedRefreshToken: {
          not: null,
        },
      },
      data: {
        hashedRefreshToken: null,
      },
    });
  }

  async refreshToken(userId: number, refreshToken: string): Promise<Tokens> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.hashedRefreshToken)
      throw new ForbiddenException('Access Denied!');
    const refreshTokenMatches = await argon.verify(
      user.hashedRefreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied!');
    const tokens = await this.getToken(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }
  async hashData(data: string) {
    return await argon.hash(data);
  }
  async getToken(userId: number, email: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.JwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: 'AccessTokenSecretKeyExample',
          expiresIn: 60 * 15, //15 minutes
        },
      ),
      this.JwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: 'RefreshTokenSecretKeyExample',
          expiresIn: 60 * 60 * 24 * 7, //1 week
        },
      ),
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
  async updateRefreshTokenHash(userId: number, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken,
      },
    });
  }
}
