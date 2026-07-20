import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Transaccion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true, type: 'varchar', length: 200 })
  sourceAccountId!: string;

  @Column({ nullable: true, type: 'varchar', length: 200 })
  destinationAccountId!: string;

  @Column({ nullable: false, type: 'varchar', length: 200 })
  type!: string;

  @Column({ nullable: true, type: 'varchar', length: 200 })
  description!: string;

  @Column({ nullable: false, type: 'decimal', precision: 14, scale: 2 })
  amount!: number;

  @Column({nullable: true, type: 'decimal', precision: 14, scale: 2, default: 0 })
  fee: number;

  @Column({ nullable: false, type: 'varchar', length: 200, unique: true })
  refCode!: string;

  @Column({ nullable: false, type: 'varchar', length: 20 })
  status!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @Column({ nullable: false, type: 'varchar', length: 30 })
  ipAddress!: string;
}