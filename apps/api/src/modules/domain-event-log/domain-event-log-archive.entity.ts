import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation, UpdateDateColumn, Column, Index } from 'typeorm'
import { DateTimeRange, DateTimeRangeColumn } from '@wisemen/datewise'
import type { DomainEventLogArchiveUuid } from './domain-event-log-archive.uuid.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

@Entity()
@Index('upper(archive.range)')
export class DomainEventLogArchive {
  @PrimaryGeneratedColumn('uuid')
  uuid: DomainEventLogArchiveUuid

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @DateTimeRangeColumn()
  range: DateTimeRange

  @Column({ type: 'uuid' })
  fileUuid: FileUuid

  @ManyToOne(() => File)
  @JoinColumn({ name: 'file_uuid' })
  file?: Relation<File>
}
