import { Controller, Get, Post, Patch, Param, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('alumni')
@UseGuards(RolesGuard)
export class AlumniController {
  @Get()
  @Roles('ADMIN', 'STAFF')
  findAll() {
    return { message: 'Full alumni list' };
  }

  @Get('directory')
  @Roles('ALUMNI')
  findDirectory() {
    return { message: 'Restricted alumni directory' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { message: `Alumni detail for ${id}` };
  }

  @Patch(':id')
  @Roles('ALUMNI', 'ADMIN')
  update(@Param('id') id: string) {
    return { message: `Update alumni ${id}` };
  }

  @Post('import')
  @Roles('ADMIN')
  importCsv() {
    return { message: 'CSV Import triggered' };
  }
}
