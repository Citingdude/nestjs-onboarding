import { Controller, Get, HttpCode, HttpStatus, Query, Res } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { UuidParam } from '@wisemen/decorators'
import { Public } from '@wisemen/nestjs-auth'
import type { FastifyReply } from 'fastify'
import { ApiErrorResponse } from '@wisemen/api-error'
import { DownloadPublicFileUseCase } from './download-public-file.use-case.js'
import { DownloadPublicFileQuery } from './download-public-file.query.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'
import { FileNotFoundError } from '#src/modules/files/errors/file.not-found.error.js'
import { buildContentDispositionHeader } from '#src/modules/files/helpers/content-disposition.header.js'

@ApiTags('File')
@Controller({ path: 'public/files', version: '1' })
export class DownloadPublicFileController {
  constructor (
    private readonly downloadPublicFileUseCase: DownloadPublicFileUseCase
  ) {}

  @Get(':file/download')
  @HttpCode(HttpStatus.FOUND)
  @Public()
  @ApiResponse({ status: HttpStatus.FOUND })
  @ApiErrorResponse(FileNotFoundError)
  async download (
    @UuidParam('file') fileUuid: FileUuid,
    @Query() query: DownloadPublicFileQuery,
    @Res() res: FastifyReply
  ): Promise<void> {
    const presignedFile = await this.downloadPublicFileUseCase.execute(fileUuid, query.token)

    res.header('Location', presignedFile.url)
    res.header('Content-Disposition', buildContentDispositionHeader(presignedFile.name))
    res.header('Content-Type', presignedFile.mimeType ?? 'application/octet-stream')
    res.redirect(presignedFile.url)
  }
}
