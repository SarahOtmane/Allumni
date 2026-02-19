import { Column, DataType, Model, Table, HasOne } from 'sequelize-typescript';
import { AlumniProfile } from '../../alumni/models/alumni-profile.model';

@Table({ tableName: 'users', underscored: true })
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password_hash: string;

  @Column({
    type: DataType.ENUM('ADMIN', 'STAFF', 'ALUMNI'),
    allowNull: false,
  })
  role: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  is_active: boolean;

  @HasOne(() => AlumniProfile)
  alumni_profile: AlumniProfile;
}
