import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { List } from '@/modules/lists/entities/list.entity';

@Entity('games')
@Unique(['gameApiId', 'list'])
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gameApiId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  coverUrl?: string;

  @Column()
  orderNumber: number;

  @ManyToOne(() => List, (list) => list.games, {
    onDelete: 'CASCADE',
  })
  list: List;
}
