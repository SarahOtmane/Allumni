import { Column, DataType, Model, Table, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { EventRegistration } from './event-registration.model';

@Table({ tableName: 'events', underscored: true })
export class Event extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  author_id: string;

  @BelongsTo(() => User)
  author: User;

  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  description: string;

  @Column({ type: DataType.DATE, allowNull: false })
  date: Date;

  @Column({ type: DataType.STRING, allowNull: false })
  location: string;

  @Column({ type: DataType.INTEGER })
  max_participants: number;

  @BelongsToMany(() => User, () => EventRegistration)
  participants: User[];
}
