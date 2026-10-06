import { ArrayUnique, IsArray, IsBoolean, IsEnum, IsOptional } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { toBoolean } from '@wisemen/nestjs-common'
import { TypesenseCollectionName, TypesenseCollectionNameApiProperty } from '#src/modules/typesense/typesense-collection-name.enum.js'

export class MigrateTypesenseQuery {
  @ApiProperty({ type: 'boolean' })
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  fresh: boolean

  @TypesenseCollectionNameApiProperty({ required: false, isArray: true })
  @IsOptional()
  @ArrayUnique()
  @IsArray()
  @IsEnum(TypesenseCollectionName, { each: true })
  collections: TypesenseCollectionName[] = Object.values(TypesenseCollectionName)
}
