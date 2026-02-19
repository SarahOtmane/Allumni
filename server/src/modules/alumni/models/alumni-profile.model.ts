import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';

@Table({ tableName: 'alumni_profiles', underscored: true })
export class AlumniProfile extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
  })
  user_id: string;

  @BelongsTo(() => User)
  user: User;

  @Column({ type: DataType.STRING, allowNull: false })
  first_name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  last_name: string;

  @Column({ type: DataType.INTEGER })
  promo_year: number;

  @Column({ type: DataType.STRING })
  diploma: string;

  @Column({ type: DataType.STRING })
  linkedin_url: string;

  @Column({ type: DataType.STRING })
  current_position: string;

  @Column({ type: DataType.STRING })
  company: string;

  @Column({
    type: DataType.ENUM('OPEN_TO_WORK', 'HIRED', 'STUDENT', 'UNKNOWN'),
    defaultValue: 'UNKNOWN',
  })
  status: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  data_enriched: boolean;
}
