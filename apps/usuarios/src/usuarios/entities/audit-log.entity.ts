import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false, unique: true, type: 'varchar', length: 200 })
  eventId!: string;

  @Column({ nullable: false, type: 'varchar', length: 200 })
  transaccionId!: string;

  @Column({ nullable: false, type: 'varchar', length: 200 })
  type!: string;

  @Column({ nullable: false, type: 'decimal', precision: 14, scale: 2 })
  amount!: number;

  @Column({ nullable: false, type: 'varchar', length: 20 })
  status!: string;

  @Column({ nullable: false, type: 'varchar', length: 20, default: 'PROCESADO' })
  processingResult!: string;

  @CreateDateColumn({ type: 'timestamp' })
  processedAt!: Date;
}
