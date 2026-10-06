import { ApiProperty } from '@nestjs/swagger'
import { IsNumberString } from 'class-validator'

export class SearchCollectionsQueryKey {
  @ApiProperty({ type: 'integer' })
  @IsNumberString()
  offset: string
}
