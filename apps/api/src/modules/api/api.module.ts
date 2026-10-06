import { type MiddlewareConsumer, Module } from '@nestjs/common'
import { BasicAuthModule } from '@wisemen/nestjs-auth'
import { AppModule } from '#src/app.module.js'
import { StatusModule } from '#src/modules/status/status.module.js'
import { AuthModule } from '#src/modules/auth/auth.module.js'
import { AuthenticatorModule } from '#src/modules/auth/authentication/authenticator/authenticator.module.js'
import { UserModule } from '#src/modules/auth/users/user.module.js'
import { AuthMiddleware } from '#src/modules/auth/middleware/auth.middleware.js'
import { RoleModule } from '#src/modules/auth/roles/role.module.js'
import { PermissionHttpModule } from '#src/modules/auth/permission/permission.http.module.js'
import { ImpersonationModule } from '#src/app/impersonation/impersonation.module.js'
import { ContactModule } from '#src/app/contact/contact.module.js'
import { UserPreferencesModule } from '#src/app/user-preferences/user-preferences.module.js'
import { AsyncApiModule } from '#src/modules/async-api/async-api.module.js'
import { DomainEventLogModule } from '#src/modules/domain-event-log/domain-event-log.module.js'
import { ErdModule } from '#src/modules/erd/erd.module.js'
import { FileModule } from '#src/modules/files/file.module.js'
import { GlobalSearchModule } from '#src/modules/global-search/global-search.module.js'
import { JobsApiModule } from '#src/modules/jobs/jobs.api-module.js'
import { LocalizationModule } from '#src/modules/localization/modules/localization.module.js'
import { NotificationModule } from '#src/modules/notification/notification.module.js'
import { OneSignalModule } from '#src/modules/one-signal/one-signal.module.js'
import { DefaultApiThrottlerModule } from '#src/modules/throttler/default-api-throttler.module.js'
import { ApiKeyModule } from '#src/modules/auth/api-key/api-key.module.js'
import { ExportModule } from '#src/app/export/export.module.js'
import { ApiSwaggerModule } from '#src/modules/swagger/api-swagger.module.js'
import { AuditModule } from '#src/modules/audit/audit.module.js'
import { AuditMiddleware } from '#src/modules/audit/audit.middleware.js'
import { DomainEventLogActorMiddleware } from '#src/modules/domain-event-log/middleware/domain-event-log-actor.middleware.js'
import { DomainEventLogActorContextModule } from '#src/modules/domain-event-log/modules/domain-event-log-actor-context/domain-event-log-actor.context.module.js'
import { McpModule } from '#src/modules/mcp/mcp.module.js'

@Module({
  imports: [
    AppModule.forRoot(),
    AuditModule,
    DomainEventLogActorContextModule,
    AsyncApiModule,
    ErdModule,
    AuthModule,
    AuthenticatorModule,
    BasicAuthModule.forRoot(),
    ApiSwaggerModule,
    StatusModule,
    UserModule,
    RoleModule,
    PermissionHttpModule,
    ImpersonationModule,
    FileModule,
    LocalizationModule,
    ContactModule,
    ExportModule,
    UserPreferencesModule,
    OneSignalModule,
    DomainEventLogModule,
    GlobalSearchModule,
    NotificationModule,
    JobsApiModule,
    ApiKeyModule,
    DefaultApiThrottlerModule,
    McpModule
  ]
})
export class ApiModule {
  configure (consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthMiddleware, DomainEventLogActorMiddleware, AuditMiddleware)
      .forRoutes('*')
  }
}
