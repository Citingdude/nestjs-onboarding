import { ZitadelModule } from '@wisemen/nestjs-zitadel'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    ZitadelModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseUrl: configService.getOrThrow<string>('ZITADEL_BASE_URL'),
        apiToken: configService.getOrThrow<string>('ZITADEL_API_TOKEN'),
        organisationId: configService.get<string>('ZITADEL_ORGANISATION_ID')
      })
    })
  ],
  exports: [ZitadelModule]
})
export class DefaultZitadelModule {}
