import { ArrayUnique, IsArray, IsEnum } from 'class-validator'
import { IsUndefinable } from '@wisemen/validators'
import { TypesenseCollectionName, TypesenseCollectionNameApiProperty } from '#src/modules/typesense/typesense-collection-name.enum.js'

export class ImportTypesenseQuery {
  @TypesenseCollectionNameApiProperty({ required: false, isArray: true })
  @IsUndefinable()
  @IsArray()
  @ArrayUnique()
  @IsEnum(TypesenseCollectionName, { each: true })
  collections: TypesenseCollectionName[] = Object.values(TypesenseCollectionName)
}
