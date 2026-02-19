import { Column, DataType, Model, Table, ForeignKey } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Event } from './event.model';

@Table({ tableName: 'event_registrations', underscored: true })
export class EventRegistration extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Event)
  @Column({ type: DataType.UUID, allowNull: false })
  event_id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  user_id: string;
}
