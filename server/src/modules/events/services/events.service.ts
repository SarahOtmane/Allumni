import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Event } from '../models/event.model';
import { EventRegistration } from '../models/event-registration.model';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { User } from '../../users/models/user.model';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event)
    private eventModel: typeof Event,
    @InjectModel(EventRegistration)
    private registrationModel: typeof EventRegistration,
  ) {}

  async create(createEventDto: CreateEventDto, authorId: string) {
    return this.eventModel.create({
      ...createEventDto,
      author_id: authorId,
    });
  }

  async findAll(userId?: string) {
    const events = await this.eventModel.findAll({
      include: [
        { model: User, as: 'author', attributes: ['id', 'email'] },
        { model: User, as: 'participants', attributes: ['id'] },
      ],
      order: [['date', 'DESC']],
    });

    if (userId) {
      return events.map((event) => {
        const plainEvent = event.get({ plain: true });
        plainEvent.isRegistered = event.participants?.some((p) => p.id === userId) || false;
        return plainEvent;
      });
    }

    return events;
  }

  async findOne(id: string) {
    const event = await this.eventModel.findByPk(id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'email'] },
        { model: User, as: 'participants', attributes: ['id', 'email'] },
      ],
    });
    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} non trouvé`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.findOne(id);
    return event.update(updateEventDto);
  }

  async remove(id: string) {
    const event = await this.findOne(id);
    await event.destroy();
    return { message: 'Événement supprimé avec succès' };
  }

  async register(eventId: string, userId: string) {
    const event = await this.findOne(eventId);

    if (event.max_participants && event.participants.length >= event.max_participants) {
      throw new ConflictException('Cet événement est complet');
    }

    const existing = await this.registrationModel.findOne({
      where: { event_id: eventId, user_id: userId },
    });

    if (existing) {
      throw new ConflictException('Vous êtes déjà inscrit à cet événement');
    }

    return this.registrationModel.create({
      event_id: eventId,
      user_id: userId,
    });
  }

  async unregister(eventId: string, userId: string) {
    const registration = await this.registrationModel.findOne({
      where: { event_id: eventId, user_id: userId },
    });

    if (!registration) {
      throw new NotFoundException('Inscription non trouvée');
    }

    await registration.destroy();
    return { message: 'Inscription annulée' };
  }
}
