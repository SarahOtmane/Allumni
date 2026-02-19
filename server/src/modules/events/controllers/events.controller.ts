import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Patch } from '@nestjs/common';
import { EventsService } from '../services/events.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('event-management')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles('ADMIN')
  async create(@Body() createEventDto: CreateEventDto, @Request() req) {
    console.log('--- CREATE EVENT ---');
    console.log('Payload:', createEventDto);
    console.log('User:', req.user);
    return this.eventsService.create(createEventDto, req.user.id);
  }

  @Get()
  @Roles('ADMIN', 'STAFF', 'ALUMNI')
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF', 'ALUMNI')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
