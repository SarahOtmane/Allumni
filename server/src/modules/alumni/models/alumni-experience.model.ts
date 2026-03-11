import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { AlumniProfile } from './alumni-profile.model';

@Table({ tableName: 'alumni_experiences', underscored: true })
export class AlumniExperience extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => AlumniProfile)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  alumni_id: string;

  @BelongsTo(() => AlumniProfile)
  profile: AlumniProfile;

  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @Column({ type: DataType.STRING, allowNull: false })
  company: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  start_date: string;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  end_date: string;

  @Column({ type: DataType.STRING, allowNull: true })
  duration: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_current: boolean;
}
