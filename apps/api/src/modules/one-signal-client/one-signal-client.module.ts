import { Module } from '@nestjs/common'
import { OneSignalClient } from './one-signal.client.js'

@Module({
  providers: [OneSignalClient],
  exports: [OneSignalClient]
})
export class OneSignalClientModule {}
