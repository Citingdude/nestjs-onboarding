import { FileStorageModule, FileStorageProvider } from '@wisemen/nestjs-file-storage'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    FileStorageModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        if (configService.getOrThrow('NODE_ENV') === 'test') {
          return { provider: FileStorageProvider.TEST }
        }

        return {
          provider: FileStorageProvider.AWS_S3,
          config: {
            bucketName: configService.get('S3_BUCKET', 'test-bucket'),
            region: configService.get('S3_REGION', 'nl-ams'),
            accessKeyId: configService.get('S3_ACCESS_KEY', 'test-keyid'),
            secretAccessKey: configService.get('S3_SECRET_KEY', 'test-key'),
            endpoint: configService.get('S3_ENDPOINT', 'test-endpoint')
          }
        }
      }
    })
  ],
  exports: [FileStorageModule]
})
export class DefaultFileStorageModule {}
