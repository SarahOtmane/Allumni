import { Column, DataType, Model, Table, BelongsToMany, HasMany } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { ConversationParticipant } from './conversation-participant.model';
import { Message } from './message.model';

@Table({ tableName: 'conversations', underscored: true })
export class Conversation extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @BelongsToMany(() => User, () => ConversationParticipant)
  participants: User[];

  @HasMany(() => Message)
  messages: Message[];
}
