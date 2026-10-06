import { type INestApplication, RequestMethod, VersioningType } from '@nestjs/common'

export const GLOBAL_PREFIX = 'api'

/**
 * RFC 9728 puts protected resource metadata at the origin root, so these two cannot sit behind the
 * global prefix.
 */
const GLOBAL_PREFIX_EXCLUDES = [
  { path: '.well-known/openai-apps-challenge', method: RequestMethod.GET },
  { path: '.well-known/oauth-protected-resource', method: RequestMethod.GET },
  { path: '.well-known/oauth-protected-resource/api/v1/mcp', method: RequestMethod.GET }
]

export function applyHttpConventions (app: INestApplication): void {
  app.setGlobalPrefix(GLOBAL_PREFIX, { exclude: GLOBAL_PREFIX_EXCLUDES })
  app.enableVersioning({ type: VersioningType.URI })
}
