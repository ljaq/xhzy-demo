import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Post } from './Post'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar' })
  name!: string

  @Column({ type: 'varchar' })
  email!: string

  @Column({ type: 'varchar', nullable: true })
  avatar?: string

  @OneToMany(() => Post, post => post.author)
  posts!: Post[]
}

