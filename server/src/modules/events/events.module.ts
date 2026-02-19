import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Event } from './models/event.model';
import { EventRegistration } from './models/event-registration.model';
import { EventsService } from './services/events.service';
import { EventsController } from './controllers/events.controller';

@Module({
  imports: [SequelizeModule.forFeature([Event, EventRegistration])],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
