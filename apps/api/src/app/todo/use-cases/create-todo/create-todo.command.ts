import { ApiProperty } from '@nestjs/swagger'
import { IsNullable } from '@wisemen/validators'
import { IsDateString, IsNotEmpty, IsString } from 'class-validator'

export class CreateTodoCommand {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({ type: String, nullable: true })
  @IsString()
  @IsNullable()
  description: string | null

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  @IsDateString({ strict: true })
  @IsNullable()
  deadline: Date | null
}
