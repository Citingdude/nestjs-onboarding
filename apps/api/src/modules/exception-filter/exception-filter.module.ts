import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpExceptionFilterModule, type HttpExceptionFilterModuleOptions } from '@wisemen/nestjs-http-exception-filter'
import { EnvType } from '#src/modules/config/env.enum.js'

@Module({
  imports: [
    HttpExceptionFilterModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): HttpExceptionFilterModuleOptions => ({
        hideInternalServerErrorDetails: configService.getOrThrow('NODE_ENV') === EnvType.PRODUCTION
      })
    })
  ],
  exports: [HttpExceptionFilterModule]
})
export class ExceptionFilterModule {}
