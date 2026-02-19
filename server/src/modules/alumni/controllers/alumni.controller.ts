import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { AlumniService } from '../services/alumni.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('alumni')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlumniController {
  constructor(private readonly alumniService: AlumniService) {}

  @Get('promos')
  @Roles('ADMIN', 'STAFF')
  findAllPromos() {
    return this.alumniService.findAllPromos();
  }

  @Post('promos')
  @Roles('ADMIN')
  createPromo(@Body('year', ParseIntPipe) year: number) {
    return this.alumniService.createPromo(year);
  }

  @Get('promos/:year')
  @Roles('ADMIN', 'STAFF')
  findByYear(@Param('year', ParseIntPipe) year: number) {
    return this.alumniService.findByYear(year);
  }

  @Post('import/:year')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  importCsv(@Param('year', ParseIntPipe) year: number, @UploadedFile() file: Express.Multer.File) {
    return this.alumniService.importCsv(year, file.buffer);
  }
}
