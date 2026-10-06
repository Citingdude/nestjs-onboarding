import { join } from 'path'
import { existsSync, createReadStream } from 'fs'
import { Controller, Get, NotFoundException, Res, Version, VERSION_NEUTRAL } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import { BasicAuth, Public } from '@wisemen/nestjs-auth'
import type { FastifyReply } from 'fastify'

@Controller()
@BasicAuth('async-api')
@ApiExcludeController()
export class AsyncAPIController {
  @Get('async-api')
  @Public()
  @Version(VERSION_NEUTRAL)
  getHTML (@Res() response: FastifyReply): void {
    const filePath = join(process.cwd() + '/dist/src/modules/async-api/async-api.html')
    if (existsSync(filePath)) {
      const stream = createReadStream(filePath)
      response.type('text/html').send(stream)
    } else {
      throw new NotFoundException()
    }
  }

  @Public()
  @Get('async-api/yaml')
  @Version(VERSION_NEUTRAL)
  getYAML (@Res() response: FastifyReply): void {
    const filePath = join(process.cwd(), '/dist/src/modules/async-api/async-api.yaml')
    if (existsSync(filePath)) {
      const stream = createReadStream(filePath)
      response.type('application/x-yaml').send(stream)
    } else {
      throw new NotFoundException()
    }
  }
}
