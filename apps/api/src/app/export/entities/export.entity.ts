import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation, UpdateDateColumn } from 'typeorm'
import type { ExportUuid } from './export.uuid.js'
import { ExportStatus, ExportStatusColumn } from './export-status.enum.js'
import { ExportType, ExportTypeColumn } from './export-type.enum.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

@Entity()
export class Export {
  @PrimaryGeneratedColumn('uuid')
  uuid: ExportUuid

  @CreateDateColumn({ precision: 3 })
  createdAt: Date

  @UpdateDateColumn({ precision: 3 })
  updatedAt: Date

  @ExportStatusColumn({ default: ExportStatus.CREATED })
  status: ExportStatus

  @ExportTypeColumn()
  type: ExportType

  @Column({ type: 'uuid', nullable: true })
  fileUuid: FileUuid | null

  @ManyToOne(() => File)
  @JoinColumn({ name: 'file_uuid' })
  file?: Relation<File | null>

  @Column({ type: 'uuid' })
  requestedByUserUuid: UserUuid

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_by_user_uuid' })
  requestedByUser?: Relation<User>

  @Column({ type: 'varchar', nullable: true })
  errorMessage: string | null
}
