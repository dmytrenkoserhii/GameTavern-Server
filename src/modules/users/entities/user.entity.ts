import * as bcrypt from 'bcrypt';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Role } from '../enums/role.enum';
import { Account } from './account.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, type: 'text', select: false })
  hashedPassword: string | null;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ default: false })
  isAccountFilled: boolean;

  @Column({ nullable: true, type: 'text', select: false })
  refreshToken: string | null;

  @Column({ nullable: true, type: 'text', select: false })
  oauthId: string | null;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, type: 'text', select: false })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true, select: false })
  resetPasswordTokenExpiresAt: Date | null;

  @Column({ default: false })
  isPremium: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Account, (account) => account.user)
  @JoinColumn()
  account: Account;

  async validatePassword(password: string): Promise<boolean> {
    if (!this.hashedPassword) {
      return Boolean(this.oauthId); // If there is no password, it means that the user is using OAuth
    }
    return bcrypt.compare(password, this.hashedPassword);
  }
}
