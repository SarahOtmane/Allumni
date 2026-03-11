import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Patch, Logger } from '@nestjs/common';
import { EventsService } from '../services/events.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('event-management')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles('ADMIN', 'STAFF')
  async create(@Body() createEventDto: CreateEventDto, @Request() req) {
    this.logger.log('--- CREATE EVENT ---');
    this.logger.log(`Payload: ${JSON.stringify(createEventDto)}`);
    this.logger.log(`User: ${JSON.stringify(req.user)}`);
    return this.eventsService.create(createEventDto, req.user.id);
  }

  @Get()
  @Roles('ADMIN', 'STAFF', 'ALUMNI')
  findAll(@Request() req) {
    return this.eventsService.findAll(req.user.id);
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF', 'ALUMNI')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post(':id/register')
  @Roles('ALUMNI')
  register(@Param('id') id: string, @Request() req) {
    return this.eventsService.register(id, req.user.id);
  }

  @Delete(':id/unregister')
  @Roles('ALUMNI')
  unregister(@Param('id') id: string, @Request() req) {
    return this.eventsService.unregister(id, req.user.id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'STAFF')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'STAFF')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
