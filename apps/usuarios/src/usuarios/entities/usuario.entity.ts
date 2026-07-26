import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false, type: 'varchar', length: 200 })
  name!: string;

  @Column({ nullable: false, unique: true, type: 'varchar', length: 100 })
  identityId!: string;

  @Column({ nullable: false, unique: true, type: 'varchar', length: 200 })
  email!: string;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  passwordHash?: string;

  @Column({ nullable: false, type: 'varchar', length: 20 })
  role!: string;

  @Column({ nullable: false, type: 'varchar', length: 20 })
  status!: string;

  @Column({ nullable: false, type: 'boolean', default: false })
  twoFactorEnabled!: boolean;

  @Column({ nullable: false, type: 'varchar', length: 200, default: 'system' })
  adminId!: string;

  @Column({ nullable: false, type: 'varchar', length: 30, default: '127.0.0.1' })
  ipAddress!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}