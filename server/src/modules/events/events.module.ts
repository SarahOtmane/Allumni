import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Event } from './models/event.model';
import { EventRegistration } from './models/event-registration.model';

@Module({
  imports: [SequelizeModule.forFeature([Event, EventRegistration])],
})
export class EventsModule {}
