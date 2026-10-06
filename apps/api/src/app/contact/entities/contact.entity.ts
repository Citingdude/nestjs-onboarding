import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation, UpdateDateColumn } from 'typeorm'
import { Currency, Monetary, MonetaryAmountColumn, MonetaryColumn } from '@wisemen/monetary'
import { PlainDateColumn, type PlainDate } from '@wisemen/datewise'
import { AddressColumn, Address } from '@wisemen/address'
import type { ContactUuid } from './contact.uuid.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

@Entity()
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  uuid: ContactUuid

  @CreateDateColumn({ precision: 3 })
  createdAt: Date

  @Index()
  @UpdateDateColumn({ precision: 3 })
  updatedAt: Date

  @Index()
  @DeleteDateColumn({ precision: 3, nullable: true })
  deletedAt: Date | null

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @Column({ type: 'varchar', nullable: true })
  firstName: string | null

  @Column({ type: 'varchar', nullable: true })
  lastName: string | null

  @Column({ type: 'varchar', nullable: true })
  email: string | null

  @Column({ type: 'varchar', nullable: true })
  phone: string | null

  @Column({ type: 'uuid', nullable: true })
  fileUuid: FileUuid | null

  @ManyToOne(() => File)
  @JoinColumn({ name: 'file_uuid' })
  file?: Relation<File | null>

  @AddressColumn({ nullable: true })
  address: Address | null

  @MonetaryAmountColumn({ currency: Currency.EUR, monetaryPrecision: 4, nullable: true })
  discount: Monetary | null

  @MonetaryColumn({ defaultPrecision: 4, nullable: true })
  balance: Monetary | null

  @PlainDateColumn({ nullable: true })
  birthDate: PlainDate | null

  @Column({ type: 'uuid', nullable: true })
  avatarUuid: FileUuid | null

  @ManyToOne(() => File)
  @JoinColumn({ name: 'avatar_uuid' })
  avatar?: Relation<File | null>
}
