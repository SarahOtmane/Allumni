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
import { UpdateAlumniDto } from '../dto/update-alumni.dto';
import { ScrapingService } from '../../scraping/services/scraping.service';

@Controller('alumni')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlumniController {
  constructor(
    private readonly alumniService: AlumniService,
    private readonly scrapingService: ScrapingService,
  ) {}

  @Get('promos')
  @Roles('ADMIN', 'STAFF', 'ALUMNI')
  findAllPromos() {
    return this.alumniService.findAllPromos();
  }

  @Post('promos')
  @Roles('ADMIN')
  createPromo(@Body('year', ParseIntPipe) year: number) {
    return this.alumniService.createPromo(year);
  }

  @Get('promos/:year')
  @Roles('ADMIN', 'STAFF', 'ALUMNI')
  findByYear(@Param('year', ParseIntPipe) year: number, @Request() req, @Query('search') search?: string) {
    return this.alumniService.findByYear(year, req.user.role, search, req.user.id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateDto: UpdateAlumniDto) {
    return this.alumniService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.alumniService.remove(id);
  }

  @Post(':id/scrape')
  @Roles('ADMIN', 'STAFF')
  async triggerScrape(@Param('id') id: string) {
    const profile = await this.alumniService.findOne(id);
    await this.scrapingService.addScrapingJob(profile.id, profile.linkedin_url);
    return { message: 'Scraping job enqueued successfully' };
  }

  @Post('import/:year')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  importCsv(@Param('year', ParseIntPipe) year: number, @UploadedFile() file: Express.Multer.File) {
    return this.alumniService.importCsv(year, file.buffer);
  }
}
