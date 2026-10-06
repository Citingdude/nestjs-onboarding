import { Injectable } from '@nestjs/common'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'

@Injectable()
export class ViewCollectionIndexUseCase {
  constructor () { }

  public execute (): TypesenseCollectionName[] {
    return Object.values(TypesenseCollectionName)
  }
}
