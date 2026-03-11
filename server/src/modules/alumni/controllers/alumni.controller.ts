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
  Patch,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { AlumniService } from '../services/alumni.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { UpdateAlumniDto } from '../dto/update-alumni.dto';

@Controller('alumni')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlumniController {
  constructor(private readonly alumniService: AlumniService) {}

  @Get('promos')
  @Roles('ADMIN', 'STAFF', 'ALUMNI')
  findAllPromos() {
    return this.alumniService.findAllPromos();
  }

  @Post('promos')
  @Roles('ADMIN', 'STAFF')
  createPromo(@Body('year', ParseIntPipe) year: number) {
    return this.alumniService.createPromo(year);
  }

  @Get('promos/:year/linkedin-urls')
  @Roles('ADMIN', 'STAFF')
  getLinkedinUrls(@Param('year', ParseIntPipe) year: number) {
    return this.alumniService.getLinkedinUrls(year);
  }

  @Get('promos/:year')
  @Roles('ADMIN', 'STAFF', 'ALUMNI')
  findByYear(@Param('year', ParseIntPipe) year: number, @Request() req, @Query('search') search?: string) {
    return this.alumniService.findByYear(year, req.user.role, search, req.user.id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'STAFF')
  update(@Param('id') id: string, @Body() updateDto: UpdateAlumniDto) {
    return this.alumniService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'STAFF')
  remove(@Param('id') id: string) {
    return this.alumniService.remove(id);
  }

  @Post('import/:year')
  @Roles('ADMIN', 'STAFF')
  @UseInterceptors(FileInterceptor('file'))
  importCsv(@Param('year', ParseIntPipe) year: number, @UploadedFile() file: Express.Multer.File) {
    return this.alumniService.importCsv(year, file.buffer);
  }

  @Post('import-scraped-data')
  @Roles('ADMIN', 'STAFF')
  importScrapedData(@Body() data: any[]) {
    return this.alumniService.importScrapedData(data);
  }
}
