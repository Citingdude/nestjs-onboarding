import { Column, Entity, PrimaryColumn } from 'typeorm'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'

@Entity()
export class TypesenseSync {
  @PrimaryColumn({ type: 'varchar' })
  collection: TypesenseCollectionName

  @Column({ type: 'timestamptz' })
  lastSyncedAt: Date
}
