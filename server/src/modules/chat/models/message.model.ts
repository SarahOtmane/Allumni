import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Conversation } from './conversation.model';

@Table({ tableName: 'messages', underscored: true })
export class Message extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Conversation)
  @Column({ type: DataType.UUID, allowNull: false })
  conversation_id: string;

  @BelongsTo(() => Conversation)
  conversation: Conversation;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  sender_id: string;

  @BelongsTo(() => User)
  sender: User;

  @Column({ type: DataType.TEXT, allowNull: false })
  content: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_read: boolean;
}
