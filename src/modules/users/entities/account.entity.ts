import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  biography: string;

  @Column({ nullable: true })
  birthDate: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.account)
  user: User;

  checkIfFullyFilled(): boolean {
    const accountFields = [
      this.username,
      this.firstName,
      this.lastName,
      this.biography,
      this.birthDate,
      this.phone,
      this.avatar,
    ];

    return accountFields.every((field) => field !== null && field !== undefined);
  }
}
