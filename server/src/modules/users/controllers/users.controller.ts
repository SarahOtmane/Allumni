import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Delete,
  Param,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { InviteUserDto } from '../dto/invite-user.dto';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import { Op } from 'sequelize';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  @Post('invite')
  @Roles('ADMIN')
  async invite(@Body() inviteDto: InviteUserDto) {
    return this.authService.inviteUser(inviteDto.email, inviteDto.role);
  }

  @Get('team')
  @Roles('ADMIN', 'STAFF')
  async getTeam() {
    return this.userModel.findAll({
      where: {
        role: {
          [Op.in]: ['ADMIN', 'STAFF'],
        },
      },
      attributes: ['id', 'email', 'role', 'is_active', 'created_at'],
      order: [['created_at', 'DESC']],
    });
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.role === 'ADMIN') {
      throw new BadRequestException('Impossible de supprimer un compte administrateur');
    }

    await user.destroy();
    return { message: "Membre de l'équipe supprimé avec succès" };
  }
}
