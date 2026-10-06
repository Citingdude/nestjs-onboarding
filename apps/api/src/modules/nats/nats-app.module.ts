import { Module } from '@nestjs/common'
import { NatsModule } from '@wisemen/nestjs-nats'
import { AuthCalloutModule } from '#src/app/auth-callout/auth-callout.module.js'
import { AppModule } from '#src/app.module.js'

@Module({
  imports: [
    AppModule.forRoot(),
    NatsModule.forRoot({
      modules: [AuthCalloutModule]
    })
  ]
})
export class NatsAppModule {}
