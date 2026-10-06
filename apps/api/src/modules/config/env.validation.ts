import Joi from 'joi'
import { EnvType } from './env.enum.js'
import { NatsAuthMethod } from '#src/modules/nats/enums/nats-auth-method.enum.js'

const validSslTypes = ['false', 'true', 'ignore']

export const envValidationSchema = Joi.object({
  TZ: Joi.string().valid('UTC').required(),
  NODE_ENV: Joi.string().valid(...Object.values(EnvType)).required(),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SSL: Joi.string().valid(...validSslTypes).required(),

  FRONTEND_URL: Joi.string().uri().required(),
  BACKEND_URL: Joi.string().uri().required(),

  AUTH_JWKS_ENDPOINT: Joi.string().uri().required(),
  AUTH_ISSUER: Joi.string().uri().required(),
  AUTH_PROJECT_ID: Joi.string().required(),

  OPENAI_APPS_CHALLENGE_TOKEN: Joi.string().optional(),

  NATS_WEBSOCKET_ENDPOINT: Joi.string().uri().optional(),
  NATS_WEBSOCKET_AUTH_METHOD: Joi.string().valid(...Object.values(NatsAuthMethod)).optional(),
  NATS_WEBSOCKET_AUTH_SECRET: Joi.string().optional(),
  NATS_WEBSOCKET_AUTH_CALLOUT_AUDIENCE: Joi.string().optional(),
  NATS_WEBSOCKET_AUTH_CALLOUT_ISSUER_KEY: Joi.string().optional()
})
