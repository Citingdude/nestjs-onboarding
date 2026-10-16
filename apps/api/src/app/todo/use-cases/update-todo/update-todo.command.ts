import { ApiProperty } from '@nestjs/swagger'
import { IsNullable } from '@wisemen/validators'
import { IsBoolean, IsDateString, IsNotEmpty, IsString } from 'class-validator'

export class UpdateTodoCommand {
  @ApiProperty({ type: String, nullable: true })
  @IsString()
  @IsNotEmpty()
  @IsNullable()
  title: string | null

  @ApiProperty({ type: String, nullable: true })
  @IsString()
  @IsNullable()
  description: string | null

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  @IsDateString({ strict: true })
  @IsNullable()
  deadline: string | null

  @ApiProperty({ type: Boolean, nullable: true })
  @IsBoolean()
  @IsNullable()
  completed: boolean | null
}
