import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { CreateOneSignalTokenController } from './create-one-signal-token.controller.js'
import { CreateOneSignalTokenUseCase } from './create-one-signal-token.use-case.js'

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          privateKey: {
            key: Buffer.from(configService.get<string>('ONESIGNAL_PRIVATE_KEY', ''), 'base64'),
            passphrase: configService.get<string>('ONESIGNAL_PASSPHRASE', '')
          },
          publicKey: Buffer.from(configService.get<string>('ONESIGNAL_PUBLIC_KEY', ''), 'base64'),
          signOptions: {
            algorithm: 'ES256'
          }
        }
      }
    })
  ],
  controllers: [CreateOneSignalTokenController],
  providers: [CreateOneSignalTokenUseCase]
})
export class CreateOneSignalTokenModule {}
