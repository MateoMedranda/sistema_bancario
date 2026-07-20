import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Cuenta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false, type: 'varchar', length: 200 })
  userId!: string;

  @Column({ nullable: false, unique: true, type: 'varchar', length: 10 })
  accountNumber!: string;

  @Column({ nullable: false, type: 'varchar', length: 200 })
  type!: string;

  @Column({type: 'decimal', precision: 14, scale: 2, nullable: false})
  balance!: number;

  @Column({ nullable: false, type: 'varchar', length: 20 })
  status!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}