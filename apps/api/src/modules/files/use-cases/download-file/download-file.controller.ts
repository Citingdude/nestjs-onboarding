import { Controller, HttpCode, HttpStatus, Post, Res, Version } from '@nestjs/common'
import { ApiTags, ApiOAuth2, ApiResponse } from '@nestjs/swagger'
import { UuidParam } from '@wisemen/decorators'
import type { FastifyReply } from 'fastify'
import { ApiErrorResponse } from '@wisemen/api-error'
import { DownloadFileUseCase } from './download-file.use-case.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'
import { FileNotFoundError } from '#src/modules/files/errors/file.not-found.error.js'
import { buildContentDispositionHeader } from '#src/modules/files/helpers/content-disposition.header.js'
import { McpExclude } from '#src/modules/mcp/decorators/mcp-exclude.decorator.js'

@ApiTags('File')
@Controller()
@ApiOAuth2([])
@McpExclude('Binary file downloads are not represented safely as MCP tool output.')
export class DownloadFileController {
  constructor (
    private readonly useCase: DownloadFileUseCase
  ) {}

  @Post('files/:file/download')
  @Version('1')
  @HttpCode(HttpStatus.FOUND)
  @Permissions(Permission.FILE_READ)
  @ApiResponse({ status: HttpStatus.FOUND })
  @ApiErrorResponse(FileNotFoundError)
  async downloadFile (
    @UuidParam('file') fileUuid: FileUuid,
    @Res() res: FastifyReply
  ): Promise<void> {
    const presignedFile = await this.useCase.execute(fileUuid)

    res.header('Location', presignedFile.url)
    res.header('Content-Disposition', buildContentDispositionHeader(presignedFile.name))
    res.header('Content-Type', presignedFile.mimeType ?? 'application/octet-stream')
    res.redirect(presignedFile.url)
  }
}
