import {
  Equals,
  IsObject,
  IsOptional,
  ValidateNested
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsUndefinable } from '@wisemen/validators'
import { PaginatedKeysetQuery, PaginatedKeysetSearchQuery } from '@wisemen/pagination'
import { GetMyNotificationsQueryKey } from './get-my-notifications.query.key.js'
import { GetMyNotificationsFilterQuery } from './get-my-notifications.filter.query.js'

export class GetMyNotificationsPaginationQuery extends PaginatedKeysetQuery {
  @ApiProperty({ type: GetMyNotificationsQueryKey, required: false, nullable: true })
  @Type(() => GetMyNotificationsQueryKey)
  @ValidateNested()
  @IsObject()
  @IsOptional()
  key?: GetMyNotificationsQueryKey | null
}

export class GetMyNotificationsQuery extends PaginatedKeysetSearchQuery {
  @Equals(undefined)
  sort?: never

  @ApiProperty({ type: GetMyNotificationsFilterQuery, required: false })
  @Type(() => GetMyNotificationsFilterQuery)
  @IsObject()
  @ValidateNested()
  @IsOptional()
  filter?: GetMyNotificationsFilterQuery

  @Equals(undefined)
  search?: never

  @ApiProperty({ type: GetMyNotificationsPaginationQuery, required: false })
  @IsUndefinable()
  @Type(() => GetMyNotificationsPaginationQuery)
  @ValidateNested()
  @IsObject()
  pagination?: GetMyNotificationsPaginationQuery
}
