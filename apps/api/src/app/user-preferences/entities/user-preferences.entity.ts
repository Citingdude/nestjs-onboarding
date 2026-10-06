import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, type Relation, UpdateDateColumn } from 'typeorm'
import { UiTheme, UiThemeColumn } from '#src/app/user-preferences/enums/ui-theme.enum.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import { DisplayZoom, DisplayZoomColumn } from '#src/app/user-preferences/enums/display-zoom.enum.js'
import { Locale } from '#src/modules/localization/enums/locale.enum.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { AutoCloseNotifications, AutoCloseNotificationsColumn } from '#src/app/user-preferences/enums/auto-close-notifications.enum.js'
import { NumberFormat, NumberFormatColumn } from '#src/app/user-preferences/enums/number-format.enum.js'
import { HourCycle, HourCycleColumn } from '#src/app/user-preferences/enums/hour-cycle.enum.js'

@Entity()
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  userUuid: UserUuid

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_uuid' })
  user?: Relation<User>

  @UiThemeColumn({ default: UiTheme.SYSTEM })
  appearance: UiTheme

  @Column({ type: 'varchar' })
  language: Locale

  @DisplayZoomColumn({ default: DisplayZoom.DEFAULT })
  displayZoom: DisplayZoom

  @Column({ type: 'boolean', default: false })
  showShortcuts: boolean

  @Column({ type: 'boolean', default: false })
  showNavigationArrows: boolean

  @AutoCloseNotificationsColumn({ default: AutoCloseNotifications.ALL_EXCEPT_ERRORS })
  autoCloseNotifications: AutoCloseNotifications

  @Column({ type: 'boolean', default: false })
  reducedMotion: boolean

  @Column({ type: 'boolean', default: false })
  highContrast: boolean

  @NumberFormatColumn({ default: NumberFormat.SYSTEM })
  numberFormat: NumberFormat

  @HourCycleColumn({ default: HourCycle.DEVICE_DEFAULT })
  hourCycle: HourCycle

  @Column({ type: 'varchar', nullable: true })
  timeZone: string | null
}
