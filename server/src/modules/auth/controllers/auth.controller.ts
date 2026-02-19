import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ActivateAccountDto } from '../dto/activate-account.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto);
    return this.authService.login(user);
  }

  @Post('activate')
  async activate(@Body() activateDto: ActivateAccountDto) {
    return this.authService.activateAccount(activateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }
}
