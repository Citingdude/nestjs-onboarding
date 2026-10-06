import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, UpdateDateColumn } from 'typeorm'
import { Notification } from './notification.entity.js'
import type { NotificationUuid } from './notification.uuid.js'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

@Entity()
@Index(['notificationUuid', 'channel'])
@Index(['userUuid', 'channel', 'readAt'], { where: `channel = 'app' AND read_at IS NULL` })
export class UserNotification {
  @Column({ type: 'uuid', primary: true })
  userUuid: UserUuid

  @Column({ type: 'uuid', primary: true })
  notificationUuid: NotificationUuid

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @Column({ type: 'timestamptz', nullable: true })
  readAt: Date | null

  @Column({ type: 'enum', enum: NotificationChannel })
  channel: NotificationChannel

  @ManyToOne(() => Notification)
  @JoinColumn({ name: 'notification_uuid' })
  notification?: Notification
}
