import { Controller, Get, HttpStatus, Res, Version, VERSION_NEUTRAL } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiExcludeController } from '@nestjs/swagger'
import { Public } from '@wisemen/nestjs-auth'
import type { FastifyReply } from 'fastify'

@ApiExcludeController()
@Controller()
export class OpenAiAppsChallengeController {
  constructor (private readonly configService: ConfigService) {}

  @Public()
  @Get('.well-known/openai-apps-challenge')
  @Version(VERSION_NEUTRAL)
  getChallenge (@Res() response: FastifyReply): void {
    const token = this.configService.get<string>('OPENAI_APPS_CHALLENGE_TOKEN')

    if (token == null || token.length === 0) {
      response.status(HttpStatus.NOT_FOUND).send()
      return
    }

    response
      .type('text/plain; charset=utf-8')
      .send(token)
  }
}
