import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Event } from '../models/event.model';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { User } from '../../users/models/user.model';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event)
    private eventModel: typeof Event,
  ) {}

  async create(createEventDto: CreateEventDto, authorId: string) {
    return this.eventModel.create({
      ...createEventDto,
      author_id: authorId,
    });
  }

  async findAll() {
    return this.eventModel.findAll({
      include: [{ model: User, as: 'author', attributes: ['id', 'email'] }],
      order: [['date', 'ASC']],
    });
  }

  async findOne(id: string) {
    const event = await this.eventModel.findByPk(id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'email'] }],
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
}
