import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
  UpdateDateColumn
} from 'typeorm'
import { NotificationPreset } from '#src/modules/notification/enums/notification-preset.enum.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

@Entity()
export class NotificationPreferencesPreset {
  @PrimaryColumn({ type: 'uuid' })
  userUuid: UserUuid

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_uuid' })
  user?: Relation<User>

  @Index()
  @Column({ type: 'enum', enum: NotificationPreset })
  preset: NotificationPreset
}
