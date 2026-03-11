import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';

export enum NotificationType {
  MESSAGE = 'MESSAGE',
  JOB = 'JOB',
  EVENT = 'EVENT',
}

@Table({ tableName: 'notifications', underscored: true })
export class Notification extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  user_id: string;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.ENUM(...Object.values(NotificationType)),
    allowNull: false,
  })
  type: NotificationType;

  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  content: string;

  @Column({ type: DataType.UUID, allowNull: true })
  reference_id: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_read: boolean;
}
