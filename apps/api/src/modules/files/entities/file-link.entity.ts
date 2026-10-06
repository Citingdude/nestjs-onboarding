import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation, UpdateDateColumn } from 'typeorm'
import { File } from './file.entity.js'
import type { FileUuid } from './file.uuid.js'
import type { FileLinkUuid } from './file-link.uuid.js'

@Entity()
@Index(['entityType', 'entityUuid'])
export class FileLink {
  @PrimaryGeneratedColumn('uuid')
  uuid: FileLinkUuid

  @CreateDateColumn({ precision: 3 })
  createdAt: Date

  @UpdateDateColumn({ precision: 3 })
  updatedAt: Date

  @Index()
  @Column({ type: 'uuid' })
  fileUuid: FileUuid

  @ManyToOne(() => File, file => file.fileEntities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_uuid' })
  file?: Relation<File>

  @Column({ type: 'varchar' })
  entityType: string

  @Index()
  @Column({ type: 'uuid' })
  entityUuid: string

  @Index()
  @Column({ type: 'varchar' })
  entityPart: string

  @Column({ type: 'smallint', nullable: true })
  order: number | null
}
