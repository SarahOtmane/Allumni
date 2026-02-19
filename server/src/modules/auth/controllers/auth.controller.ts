import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ActivateAccountDto } from '../dto/activate-account.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('activate')
  async activate(@Body() activateDto: ActivateAccountDto) {
    return this.authService.activateAccount(activateDto);
  }
}
