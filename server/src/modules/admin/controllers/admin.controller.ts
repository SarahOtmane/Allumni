import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @Roles('ADMIN', 'STAFF')
  async getStats() {
    return this.adminService.getStats();
  }
}
