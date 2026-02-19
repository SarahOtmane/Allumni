import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { InviteUserDto } from '../dto/invite-user.dto';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Post('invite')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async invite(@Body() inviteDto: InviteUserDto) {
    return this.authService.inviteUser(inviteDto.email, inviteDto.role);
  }
}
