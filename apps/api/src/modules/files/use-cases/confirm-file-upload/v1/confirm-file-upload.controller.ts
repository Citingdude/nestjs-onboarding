import { Controller, Post, HttpCode, HttpStatus, Version } from '@nestjs/common'
import { ApiTags, ApiOAuth2, ApiNoContentResponse, ApiOperation } from '@nestjs/swagger'
import { UuidParam } from '@wisemen/decorators'
import { ApiErrorResponse } from '@wisemen/api-error'
import { ConfirmFileUploadUseCase } from './confirm-file-upload.use-case.js'
import { Permissions } from '#src/modules/auth/permission/permission.decorator.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'
import { FileNotFoundError } from '#src/modules/files/errors/file.not-found.error.js'
import { McpExclude } from '#src/modules/mcp/decorators/mcp-exclude.decorator.js'

@ApiTags('File')
@Controller()
@ApiOAuth2([])
@McpExclude('File-upload confirmation belongs to a binary transfer workflow.')
export class ConfirmFileUploadController {
  constructor (
    private readonly useCase: ConfirmFileUploadUseCase
  ) {}

  @Post('files/:file/confirm-upload')
  @Version('1')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions(Permission.FILE_CREATE)
  @ApiNoContentResponse()
  @ApiErrorResponse(FileNotFoundError)
  @ApiOperation({ deprecated: true })
  async confirmFileUpload (
    @UuidParam('file') fileUuid: FileUuid
  ): Promise<void> {
    await this.useCase.execute(fileUuid)
  }
}
