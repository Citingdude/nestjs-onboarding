import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { TypesenseSync } from './typesense-sync.entity.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'

@Injectable()
export class TypesenseSyncRepository {
  constructor (
    @InjectRepository(TypesenseSync)
    private readonly syncRepository: TypeOrmRepository<TypesenseSync>
  ) {}

  async fetchLastSyncedAt (forCollection: TypesenseCollectionName): Promise<Date | null> {
    const sync = await this.syncRepository.findOneBy({ collection: forCollection })

    return sync?.lastSyncedAt ?? null
  }

  async updateLastSyncedAt (forCollection: TypesenseCollectionName, at: Date): Promise<void> {
    await this.syncRepository.upsert(
      { collection: forCollection, lastSyncedAt: at },
      { conflictPaths: { collection: true } }
    )
  }
}
