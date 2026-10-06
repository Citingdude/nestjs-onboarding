import { Column, Entity } from 'typeorm'
import { NotificationType, NotificationTypeColumn } from '#src/modules/notification/enums/notification-types.enum.js'

@Entity()
export class NotificationMigration {
  @NotificationTypeColumn({ primary: true })
  type: NotificationType

  @Column({ type: 'timestamptz' })
  migratedAt: Date
}
