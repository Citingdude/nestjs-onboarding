import { Module, type INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LOCAL_SERVER_URL, SwaggerModule } from '@wisemen/nestjs-swagger'
import { BasicAuthModule } from '@wisemen/nestjs-auth'
import { parseEnvList } from '@wisemen/nestjs-common'
import { EnvType } from '#src/modules/config/env.enum.js'

@Module({
  imports: [
    BasicAuthModule.forFeatureAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        return {
          swagger: {
            username: cfg.get('DOCS_USERNAME', 'wisemen'),
            password: cfg.get('DOCS_PASSWORD', 'wisemen')
          }
        }
      }
    }),
    SwaggerModule.forRoot()
  ]
})
export class ApiSwaggerModule {
  static async setupDocs (app: INestApplication, cfg: ConfigService): Promise<void> {
    const env = cfg.getOrThrow<EnvType>('NODE_ENV')

    let basicAuth: string | undefined
    if (env === EnvType.PRODUCTION) {
      basicAuth = 'swagger'
    }

    const servers = parseEnvList(cfg.get<string>('OPEN_API_SERVERS'))

    let redirectServer: string | undefined
    if (env === EnvType.LOCAL) {
      redirectServer = LOCAL_SERVER_URL
      servers.push(LOCAL_SERVER_URL)
    } else if (servers.length > 0) {
      redirectServer = servers[0]
    }

    const additionalScopes: Record<string, string> = {}
    const additionalScopeObjects = parseEnvList(cfg.get<string>('OPEN_API_SCOPES'))

    for (const scopeObject of additionalScopeObjects) {
      const [scope, description] = scopeObject.split(' ')

      if (scope == null) {
        continue
      }

      additionalScopes[scope] = description ?? scope
    }

    const oidcUrl = cfg.get<string>('OPEN_API_OPENID_CONFIGURATION_URL')

    await SwaggerModule.attachSwaggerEndpoints(app, {
      basicAuth,
      redirectServer,
      servers,
      additionalScopes,
      oidcUrl
    })
  }
}
