import '#src/modules/opentelemetry/instrumentation.js'
import { NestFactory } from '@nestjs/core'
import type { INestApplicationContext } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import qs from 'qs'
import { FastifyContainer } from '@wisemen/app-container/fastify'
import { NestjsOtelLogger } from '@wisemen/opentelemetry'
import { parseEnvList } from '@wisemen/nestjs-common'
import type { RawServerDefault } from 'fastify'
import { EnvType } from '#src/modules/config/env.enum.js'
import { ApiModule } from '#src/modules/api/api.module.js'
import { applyHttpConventions } from '#src/modules/api/http-conventions.js'
import { ApiSwaggerModule } from '#src/modules/swagger/api-swagger.module.js'

class Api extends FastifyContainer {
  getFastifyOptions (): ConstructorParameters<typeof FastifyAdapter<RawServerDefault>>[0] {
    return {
      trustProxy: (_address, hop) => hop === 0,
      routerOptions: {
        querystringParser: (str: string) => qs.parse(str),
        ignoreDuplicateSlashes: false,
        caseSensitive: true,
        ignoreTrailingSlash: false,
        allowUnsafeRegex: false
      }
    }
  }

  async bootstrap (adapter: FastifyAdapter): Promise<INestApplicationContext> {
    const app = await NestFactory.create<NestFastifyApplication>(ApiModule, adapter)

    const cfg = app.get(ConfigService)
    const env = cfg.getOrThrow<string>('NODE_ENV')

    if (env !== EnvType.LOCAL) {
      const otelLogger = app.get(NestjsOtelLogger)
      app.useLogger(otelLogger)
    }

    applyHttpConventions(app)

    const allowedOrigins = parseEnvList(cfg.get<string>('CORS_ALLOWED_ORIGINS'))
    const allowedOriginsRegexList = parseEnvList(cfg.get<string>('CORS_ALLOWED_ORIGINS_REGEX'))
      .map(regex => new RegExp(regex))

    app.getHttpAdapter().enableCors({
      exposedHeaders: ['Content-Disposition', 'Mcp-Session-Id'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Traceparent',
        'Accept-Language',
        'Mcp-Session-Id',
        'Mcp-Protocol-Version'
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      origin: (origin: string, cb: (err: Error | null, allow?: boolean) => void) => {
        if (origin == null) return cb(null, true)
        if (allowedOrigins.includes(origin)) return cb(null, true)
        if (allowedOriginsRegexList.some(pattern => pattern.test(origin))) {
          return cb(null, true)
        }
        return cb(new Error('CORS blocked'), false)
      },
      credentials: false
    })

    await ApiSwaggerModule.setupDocs(app, cfg)

    return app
  }
}

const _api = new Api()
