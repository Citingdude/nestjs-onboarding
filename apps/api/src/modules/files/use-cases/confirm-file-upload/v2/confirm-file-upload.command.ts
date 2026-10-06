import { ApiProperty } from '@nestjs/swagger'
import { IsNullable } from '@wisemen/validators'
import { IsString, MaxLength } from 'class-validator'

export const MAX_BLUR_HASH_LENGTH = 100

export class ConfirmFileUploadCommand {
  @ApiProperty({ type: String, nullable: true, maxLength: MAX_BLUR_HASH_LENGTH })
  @IsString()
  @MaxLength(MAX_BLUR_HASH_LENGTH)
  @IsNullable()
  blurHash: string | null
}
