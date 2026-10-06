import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Column, OneToMany, type Relation, ManyToOne, JoinColumn } from 'typeorm'
import { FileLink } from './file-link.entity.js'
import type { FileUuid } from './file.uuid.js'
import type { FileVariant } from './file-variant.type.js'
import type { MimeType } from '#src/modules/files/enums/mime-type.enum.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  uuid: FileUuid

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'varchar' })
  mimeType: MimeType

  @Column({ type: 'boolean', default: false })
  isUploadConfirmed: boolean

  @OneToMany(() => FileLink, fileLink => fileLink.file)
  fileEntities?: Array<Relation<FileLink>>

  @Column({ type: 'varchar' })
  key: string

  @Column({ type: 'jsonb', default: [] })
  variants: FileVariant[]

  @Column({ type: 'varchar', nullable: true })
  blurHash: string | null

  @Column({ type: 'boolean', default: false })
  isPublic: boolean

  @Column({ type: 'uuid', nullable: true })
  uploaderUuid: UserUuid | null

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploader_uuid' })
  uploader?: Relation<User> | null
}
