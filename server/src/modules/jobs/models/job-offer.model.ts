import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';

@Table({ tableName: 'job_offers', underscored: true })
export class JobOffer extends Model {
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

  @Column({ type: DataType.STRING, allowNull: false })
  company: string;

  @Column({ type: DataType.STRING, allowNull: false })
  location: string;

  @Column({
    type: DataType.ENUM('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE'),
    allowNull: false,
  })
  type: string;

  @Column({ type: DataType.STRING })
  salary_range: string;

  @Column({
    type: DataType.ENUM('ACTIVE', 'CLOSED'),
    defaultValue: 'ACTIVE',
  })
  status: string;
}
