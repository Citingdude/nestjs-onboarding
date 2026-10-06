import { describe, it } from 'node:test'
import { HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { expect } from 'expect'
import { createStubInstance, stub } from 'sinon'
import type { FastifyReply } from 'fastify'
import { OpenAiAppsChallengeController } from './openai-apps-challenge.controller.js'

describe('OpenAiAppsChallengeController', () => {
  it('returns 404 when verification is not configured', () => {
    const config = createStubInstance(ConfigService)
    const response = createResponse()
    const controller = new OpenAiAppsChallengeController(config)

    controller.getChallenge(response.reply)

    expect(response.status.calledWith(HttpStatus.NOT_FOUND)).toBe(true)
    expect(response.send.calledWith()).toBe(true)
  })

  it('returns the configured token as plain text', () => {
    const config = createStubInstance(ConfigService)
    config.get.returns('verification-token')
    const response = createResponse()
    const controller = new OpenAiAppsChallengeController(config)

    controller.getChallenge(response.reply)

    expect(response.type.calledWith('text/plain; charset=utf-8')).toBe(true)
    expect(response.send.calledWith('verification-token')).toBe(true)
  })
})

function createResponse () {
  const status = stub()
  const type = stub()
  const send = stub()
  const reply = {
    status: (code: number) => {
      status(code)
      return reply
    },
    type: (contentType: string) => {
      type(contentType)
      return reply
    },
    send: (payload?: unknown) => {
      send(payload)
      return reply
    }
  } as unknown as FastifyReply

  return { reply, send, status, type }
}
