import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import type { Relation } from '@wisemen/nestjs-typeorm'
import type { TodoUuid } from '#src/app/todo/entities/todo.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'

@Entity()
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  uuid: TodoUuid

  @Column({ type: 'text' })
  title: string

  @Column({ type: 'text', nullable: true })
  description: string | null

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date | null

  @Column({ type: 'boolean', default: false })
  completed: boolean

  @CreateDateColumn({ precision: 3 })
  createdAt: Date

  @UpdateDateColumn({ precision: 3 })
  updatedAt: Date

  @Index()
  @Column({ type: 'uuid' })
  userUuid: UserUuid

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_uuid' })
  user?: Relation<User>
}
