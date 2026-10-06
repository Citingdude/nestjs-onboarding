import { Module } from '@nestjs/common'
import { AuditMiddleware } from './audit.middleware.js'
import { DefaultOtelModule } from '#src/modules/opentelemetry/default-otel.module.js'

@Module({
  imports: [DefaultOtelModule],
  providers: [AuditMiddleware]
})
export class AuditModule {}
