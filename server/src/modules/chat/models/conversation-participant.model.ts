import { Column, DataType, Model, Table, ForeignKey } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Conversation } from './conversation.model';

@Table({ tableName: 'conversation_participants', underscored: true })
export class ConversationParticipant extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Conversation)
  @Column({ type: DataType.UUID, allowNull: false })
  conversation_id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  user_id: string;
}
