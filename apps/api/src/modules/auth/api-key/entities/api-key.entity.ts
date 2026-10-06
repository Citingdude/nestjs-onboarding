import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import type { ApiKeyUuid } from './api-key.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import type { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  uuid: ApiKeyUuid

  @CreateDateColumn({ precision: 3, type: 'timestamptz' })
  createdAt: Date

  @DeleteDateColumn({ type: 'timestamptz', precision: 3, nullable: true })
  deletedAt: Date | null

  @Column({ type: 'timestamptz', precision: 3, nullable: true })
  expiresAt: Date | null

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'varchar', array: true, default: [] })
  permissions: Permission[]

  @Column({ type: 'varchar', unique: true })
  secretHash: string

  @Column({ type: 'varchar' })
  secretLastChars: string

  @Column({ type: 'uuid' })
  userUuid: UserUuid

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_uuid' })
  user?: Relation<User>
}
