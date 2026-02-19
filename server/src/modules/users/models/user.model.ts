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
    allowNull: true,
  })
  password_hash: string;

  @Column({
    type: DataType.ENUM('ADMIN', 'STAFF', 'ALUMNI'),
    allowNull: false,
  })
  role: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_active: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  activation_token: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  token_expires_at: Date;

  @HasOne(() => AlumniProfile)
  alumni_profile: AlumniProfile;
}
