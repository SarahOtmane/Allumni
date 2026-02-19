import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Patch, Query } from '@nestjs/common';
import { JobsService } from '../services/jobs.service';
import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @Roles('ADMIN', 'STAFF')
  create(@Body() createJobDto: CreateJobDto, @Request() req) {
    return this.jobsService.create(createJobDto, req.user.id);
  }

  @Get()
  @Roles('ADMIN', 'STAFF', 'ALUMNI')
  findAll(@Query('title') title?: string, @Query('location') location?: string, @Query('sort') sort?: 'ASC' | 'DESC') {
    return this.jobsService.findAll({ title, location, sort });
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF', 'ALUMNI')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'STAFF')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(id, updateJobDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'STAFF')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }
}
