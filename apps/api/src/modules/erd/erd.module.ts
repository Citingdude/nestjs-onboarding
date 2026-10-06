import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BasicAuthModule } from '@wisemen/nestjs-auth'
import { ErdController } from './erd.controller.js'

@Module({
  imports: [
    BasicAuthModule.forFeatureAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        erd: {
          username: cfg.get<string>('DOCS_USERNAME', 'wisemen'),
          password: cfg.get<string>('DOCS_PASSWORD', 'wisemen')
        }
      })
    })
  ],
  controllers: [ErdController]
})
export class ErdModule {}
