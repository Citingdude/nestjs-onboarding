import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { NatsAuthorizationRequestParser } from '@wisemen/nestjs-nats'
import { AuthCalloutPermissions } from './auth-callout-permissions.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import { AuthCalloutNatsService } from '#src/app/auth-callout/auth-callout.nats-service.js'
import { AuthCalloutConfig } from '#src/app/auth-callout/auth-callout.config.js'
import { AuthorizationServiceModule } from '#src/modules/auth/authorization/authorization.service.module.js'
import { AuthenticatorModule } from '#src/modules/auth/authentication/authenticator/authenticator.module.js'

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    AuthenticatorModule,
    AuthorizationServiceModule
  ],
  providers: [
    AuthCalloutNatsService,
    AuthCalloutConfig,
    NatsAuthorizationRequestParser,
    AuthCalloutPermissions
  ]
})
export class AuthCalloutModule {}
