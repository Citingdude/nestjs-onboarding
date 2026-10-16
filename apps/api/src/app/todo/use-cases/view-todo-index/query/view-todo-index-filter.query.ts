import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class ViewTodoIndexFilterQuery {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  completed?: string
}
