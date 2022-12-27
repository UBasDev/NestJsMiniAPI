import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AccessTokenGuard } from './guards/access-token.guard';
import { Tokens } from './types';
import { AuthService } from './auth.service';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthDto } from './dto';
import { HttpStatus } from '@nestjs/common/enums';
import { HttpCode, Req, UseGuards } from '@nestjs/common/decorators';
import {
  GetUserDecorator,
  GetUserIdDecorator,
  PublicDecorator,
} from './decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicDecorator()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() requestBody: AuthDto): Promise<Tokens> {
    return await this.authService.signUp(requestBody);
  }

  @PublicDecorator()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() requestBody: AuthDto): Promise<Tokens> {
    return await this.authService.signIn(requestBody);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@GetUserIdDecorator() userId: number): Promise<void> {
    return await this.authService.logout(userId);
  }

  @PublicDecorator()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @GetUserDecorator('refreshToken') refreshToken: string,
    @GetUserIdDecorator() userId: number,
  ): Promise<Tokens> {
    return await this.authService.refreshToken(userId, refreshToken);
  }
}
