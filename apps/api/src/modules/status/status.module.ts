import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiStatusModule } from '@wisemen/nestjs-api-status'

@Module({
  imports: [
    ApiStatusModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        environment: configService.getOrThrow('NODE_ENV'),
        commit: configService.getOrThrow('BUILD_COMMIT'),
        version: configService.getOrThrow('BUILD_NUMBER'),
        timestamp: configService.getOrThrow('BUILD_TIMESTAMP')
      }),
      controller: { isPublic: true }
    })
  ]
})
export class StatusModule {}
