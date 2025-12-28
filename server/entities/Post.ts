import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { User } from './User'

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar' })
  title!: string

  @Column({ type: 'text' })
  content!: string

  @Column({ type: 'integer' })
  authorId!: number

  @ManyToOne(() => User, user => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author!: User

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date
}

