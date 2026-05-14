import { Controller, Post, Body, UseGuards, Request, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { IsEmail, IsString, MinLength, MaxLength, IsNumberString, Length } from 'class-validator';

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(4)
  password!: string;
}

class PinLoginDto {
  @IsNumberString()
  @Length(4, 6)
  pin!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      return { statusCode: 401, message: 'Invalid credentials' };
    }
    return this.authService.login(user as Record<string, unknown>);
  }

  @Post('login/pin')
  @HttpCode(200)
  async loginWithPin(@Body() body: PinLoginDto) {
    return this.authService.loginWithPin(body.pin);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  async refresh(@Request() req: { user: Record<string, unknown> }) {
    return this.authService.login(req.user);
  }

  @Post('logout')
  @HttpCode(200)
  logout() {
    // Client should discard the token
    return { message: 'Logged out successfully' };
  }
}
