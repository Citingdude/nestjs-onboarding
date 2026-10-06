import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBooleanString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { MimeType } from '#src/modules/files/enums/mime-type.enum.js'

export class CreateFileCommand {
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  name: string

  @ApiProperty({ type: 'string', enum: MimeType, enumName: 'MimeType' })
  @IsNotEmpty()
  @IsEnum(MimeType)
  mimeType: MimeType

  @ApiPropertyOptional({ type: 'boolean', default: false })
  @IsOptional()
  @IsBooleanString()
  isPublic?: string
}
