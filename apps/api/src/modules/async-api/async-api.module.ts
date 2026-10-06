import { Module } from '@nestjs/common'
import { BasicAuthModule } from '@wisemen/nestjs-auth'
import { ConfigService } from '@nestjs/config'
import { AsyncAPIController } from './async-api.controller.js'

@Module({
  imports: [
    BasicAuthModule.forFeatureAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        'async-api': {
          username: cfg.get<string>('DOCS_USERNAME', 'wisemen'),
          password: cfg.get<string>('DOCS_PASSWORD', 'wisemen')
        }
      })
    })
  ],
  controllers: [AsyncAPIController]
})
export class AsyncApiModule {}
