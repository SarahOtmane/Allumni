import { Column, DataType, Model, Table, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { AlumniExperience } from './alumni-experience.model';

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

  @HasMany(() => AlumniExperience)
  experiences: AlumniExperience[];

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

  @Column({
    type: DataType.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'),
    defaultValue: 'PENDING',
    allowNull: false,
  })
  scraping_status: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  scraping_error: string;

  @Column({ type: DataType.DATE, allowNull: true })
  last_scraped_at: Date;
}
