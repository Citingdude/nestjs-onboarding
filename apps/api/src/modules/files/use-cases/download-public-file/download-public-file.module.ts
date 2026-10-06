import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { DownloadPublicFileController } from './download-public-file.controller.js'
import { DownloadPublicFileUseCase } from './download-public-file.use-case.js'
import { FilePresignerModule } from '#src/modules/files/modules/file-presigner/file-presigner.module.js'
import { File } from '#src/modules/files/entities/file.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    FilePresignerModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        privateKey: {
          key: Buffer.from(configService.getOrThrow<string>('RSA_PRIVATE'), 'base64'),
          passphrase: configService.getOrThrow<string>('RSA_PASSPHRASE')
        },
        publicKey: Buffer.from(configService.getOrThrow<string>('RSA_PUBLIC'), 'base64'),
        signOptions: {
          algorithm: 'RS256'
        }
      })
    })
  ],
  controllers: [DownloadPublicFileController],
  providers: [DownloadPublicFileUseCase]
})
export class DownloadPublicFileModule {}
