import { Module } from '@nestjs/common'
import { DiscoveryModule } from '@nestjs/core'
import { McpController } from './mcp.controller.js'
import { McpDiscoveryService } from './mcp-discovery.service.js'
import { McpExecutor } from './mcp-executor.js'
import { McpAuthChallengeFilter } from './filters/mcp-auth-challenge.filter.js'
import { McpOAuthConfig } from './oauth/mcp-oauth.config.js'
import { McpProtectedResourceController } from './oauth/mcp-protected-resource.controller.js'
import { OpenAiAppsChallengeController } from './verification/openai-apps-challenge.controller.js'
import { PermissionsGuardModule } from '#src/modules/auth/permission/guard/permission.guard.module.js'
import { AuthorizationServiceModule } from '#src/modules/auth/authorization/authorization.service.module.js'
import { ExceptionFilterModule } from '#src/modules/exception-filter/exception-filter.module.js'

@Module({
  imports: [
    DiscoveryModule,
    PermissionsGuardModule,
    AuthorizationServiceModule,
    ExceptionFilterModule
  ],
  controllers: [
    McpController,
    McpProtectedResourceController,
    OpenAiAppsChallengeController
  ],
  providers: [
    McpDiscoveryService,
    McpExecutor,
    McpOAuthConfig,
    McpAuthChallengeFilter
  ]
})
export class McpModule {}
