import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class ViewContactIndexFilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  isActive?: string
}
