import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'promotions', underscored: true })
export class Promotion extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
    unique: true,
  })
  year: number;
}
