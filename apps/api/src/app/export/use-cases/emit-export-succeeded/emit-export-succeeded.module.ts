import { Module } from '@nestjs/common'
import { EmitExportSucceededSubscriber } from '#src/app/export/use-cases/emit-export-succeeded/emit-export-succeeded.subscriber.js'
import { DefaultNatsPublisherModule } from '#src/modules/nats/nats-publisher.module.js'

@Module({
  imports: [DefaultNatsPublisherModule],
  providers: [EmitExportSucceededSubscriber]
})
export class EmitExportSucceededModule {}
