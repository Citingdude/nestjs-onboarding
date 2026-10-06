import { Module } from '@nestjs/common'
import { EmitExportFailedSubscriber } from '#src/app/export/use-cases/emit-export-failed/emit-export-failed.subscriber.js'
import { DefaultNatsPublisherModule } from '#src/modules/nats/nats-publisher.module.js'

@Module({
  imports: [DefaultNatsPublisherModule],
  providers: [EmitExportFailedSubscriber]
})
export class EmitExportFailedModule {}
