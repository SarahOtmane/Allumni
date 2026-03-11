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
  Request,
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
  @Roles('ADMIN', 'STAFF')
  async invite(@Body() inviteDto: InviteUserDto, @Request() req) {
    // Hierarchy check: STAFF cannot invite an ADMIN
    if (req.user.role === 'STAFF' && inviteDto.role === 'ADMIN') {
      throw new BadRequestException('Un membre du staff ne peut pas inviter un administrateur');
    }
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
  @Roles('ADMIN', 'STAFF')
  async remove(@Param('id') id: string, @Request() req) {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Hierarchy check: STAFF cannot remove an ADMIN
    if (req.user.role === 'STAFF' && user.role === 'ADMIN') {
      throw new BadRequestException('Un membre du staff ne peut pas supprimer un administrateur');
    }

    // Protection: Cannot remove self
    if (req.user.id === user.id) {
      throw new BadRequestException('Impossible de supprimer votre propre compte');
    }

    await user.destroy();
    return { message: "Membre de l'équipe supprimé avec succès" };
  }
}
