import { Module } from '@nestjs/common'
import { SendTestNotificationUseCase } from './send-test-notification.use-case.js'
import { SendTestNotificationController } from './send-test-notification.controller.js'
import { DefaultPgBossSchedulerModule } from '#src/modules/pgboss/default-pgboss-scheduler.module.js'

@Module({
  imports: [DefaultPgBossSchedulerModule],
  controllers: [SendTestNotificationController],
  providers: [SendTestNotificationUseCase]
})
export class SendTestNotificationModule {}
