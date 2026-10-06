import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import dayjs from 'dayjs'
import { CreateOneSignalTokenResponse } from './create-one-signal-token.response.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'

@Injectable()
export class CreateOneSignalTokenUseCase {
  constructor (
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authContext: AuthContext
  ) {}

  execute (): CreateOneSignalTokenResponse {
    const userUuid = this.authContext.getUserUuidOrFail()

    const token = this.jwtService.sign({
      iss: this.configService.getOrThrow<string>('ONE_SIGNAL_APP_ID'),
      exp: dayjs().add(1, 'hour').unix(),
      identity: {
        external_id: userUuid
      }
    })

    return new CreateOneSignalTokenResponse(token, userUuid)
  }
}
