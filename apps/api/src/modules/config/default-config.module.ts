import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envValidationSchema } from './env.validation.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      validationSchema: envValidationSchema,
      isGlobal: true,
      cache: true
    })
  ]
})
export class DefaultConfigModule {}
