import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import type { NotificationUuid } from './notification.uuid.js'
import { NotificationType, NotificationTypeColumn } from '#src/modules/notification/enums/notification-types.enum.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  uuid: NotificationUuid

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @Column({ type: 'uuid', nullable: true })
  createdByUserUuid: UserUuid | null

  @NotificationTypeColumn()
  type: NotificationType

  @Column({ type: 'jsonb' })
  meta: object

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_user_uuid' })
  createdByUser?: User | null
}
