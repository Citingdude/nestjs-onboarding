import { ApiProperty } from '@nestjs/swagger'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'

export class ViewCollectionIndexResponse {
  @ApiProperty({ enum: TypesenseCollectionName, isArray: true })
  collections: TypesenseCollectionName[]

  constructor (collections: TypesenseCollectionName[]) {
    this.collections = collections
  }
}
