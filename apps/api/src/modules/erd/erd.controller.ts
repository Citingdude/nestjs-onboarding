import path, { join } from 'path'
import { existsSync } from 'fs'
import fs from 'fs'
import { Controller, Get, NotFoundException, Res, Version, VERSION_NEUTRAL } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import { BasicAuth, Public } from '@wisemen/nestjs-auth'
import type { FastifyReply } from 'fastify'

@Controller()
@ApiExcludeController()
export class ErdController {
  @Get('erd')
  @Public()
  @BasicAuth('erd')
  @Version(VERSION_NEUTRAL)
  getHTML (@Res() response: FastifyReply) {
    const filePath = path.resolve('./dist/src/modules/erd/erd.dbml')
    if (existsSync(filePath)) {
      const filePath = join(process.cwd() + '/dist/src/modules/modules/erd/erd.dbml')
      const stream = fs.createReadStream(filePath)

      return response.type('text/html; charset=utf-8')
        .send(stream)
    } else {
      throw new NotFoundException()
    }
  }
}
