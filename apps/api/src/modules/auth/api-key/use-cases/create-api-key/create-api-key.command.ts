import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, ArrayUnique, IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { PermissionApiProperty } from '#src/modules/auth/permission/permission.api-property.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

export class CreateApiKeyCommand {
  @ApiProperty({ type: String, example: 'Primary integration key' })
  @IsNotEmpty()
  @IsString()
  name: string

  @PermissionApiProperty({ isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(Permission, { each: true })
  permissions: Permission[]

  @ApiProperty({ type: String, format: 'date-time', required: false, nullable: true })
  @IsOptional()
  @IsDateString({ strict: true })
  expiresAt?: string | null
}
