---
name: api-feature-example
description: Use when scaffolding a new domain feature/use-case end-to-end (entity, module, controller, use-case, command/response DTOs, repository, domain event) or when reviewing/extending generated code against repo conventions.
---

# API Feature Example

Prefer generating a new feature over writing it by hand: run `pnpx @wisemen/ngen` from the
repo root and pick `module / useCase`. See the `packages@wisemen-ngen@module-generator` skill
for prompts, options, and gotchas. Use `packages@wisemen-ngen@job-generator`,
`@wisemen-ngen@cronjob-generator`, `@wisemen-ngen@builder-generator`,
`@wisemen-ngen@typesense-generator`, and `@wisemen-ngen@translations-generator` for their
respective scaffolds.

The example below shows the conventions the generated (or hand-written) code should follow —
use it as a reference when reviewing generated output, extending a use-case, or writing one
manually.

## Entity Example

An example of a contact entity.
The entity should live in `src/app/contact/entities/`

### contact.entity.ts

```ts
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from 'typeorm'
import { Currency, Monetary, MonetaryAmountColumn, MonetaryColumn } from '@wisemen/monetary'
import { WiseDateColumn, WiseDate } from '@wisemen/wise-date'
import { AddressColumn, Address } from '@wisemen/address'
import { File } from '../../../modules/files/entities/file.entity.js'
import { FileUuid } from '../../../modules/files/entities/file.uuid.js'
import { ContactUuid } from './contact.uuid.js'

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
  file?: Relation<File | null>

  @AddressColumn({ nullable: true })
  address: Address | null

  @MonetaryAmountColumn({ currency: Currency.EUR, monetaryPrecision: 4, nullable: true })
  discount: Monetary | null

  @MonetaryColumn({ defaultPrecision: 4, nullable: true })
  balance: Monetary | null

  @WiseDateColumn({ nullable: true })
  birthDate: WiseDate | null

  @Column({ type: 'uuid', nullable: true })
  avatarUuid: FileUuid | null

  @ManyToOne(() => File)
  avatar?: Relation<File | null>
}
```

### contact.uuid.ts
```ts
import { Uuid } from '../../../utils/types/uuid.js'

export type ContactUuid = Uuid<'Contact'>
```

## Use case with controller example

An example of a Create contact use case.
Each file should live in `src/app/contact/use-cases/create-contact/`

### create-contact.module.ts
```ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { Contact } from '../../entities/contact.entity.js'
import { File } from '../../../../modules/files/entities/file.entity.js'
import { CreateContactUseCase } from './create-contact.use-case.js'
import { CreateContactController } from './create-contact.controller.js'
import { CreateContactRepository } from './create-contact.repository.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact, File])
  ],
  controllers: [
    CreateContactController
  ],
  providers: [
    CreateContactUseCase,
    CreateContactRepository
  ]
})
export class CreateContactModule { }
```

### create-contact.controller.ts
```ts
import { Body, Controller, Post, Version } from '@nestjs/common'
import { ApiCreatedResponse, ApiOAuth2, ApiTags } from '@nestjs/swagger'
import { Permission } from '../../../../modules/permission/permission.enum.js'
import { Permissions } from '../../../../modules/permission/permission.decorator.js'
import { ApiErrorResponse } from '../../../../modules/exceptions/api-errors/api-error-response.decorator.js'
import { FileNotFoundError } from '../../../../modules/files/errors/file.not-found.error.js'
import { CreateContactCommand } from './create-contact.command.js'
import { CreateContactResponse } from './create-contact.response.js'
import { CreateContactUseCase } from './create-contact.use-case.js'

@ApiTags('Contact')
@ApiOAuth2([])
@Controller()
export class CreateContactController {
  constructor (
    private readonly createContactUseCase: CreateContactUseCase
  ) { }

  @Post('contacts')
  @Version('1')
  @Permissions(Permission.CONTACT_CREATE)
  @ApiCreatedResponse({ type: CreateContactResponse })
  @ApiErrorResponse(FileNotFoundError)
  public async createContact (
    @Body() createContactCommand: CreateContactCommand
  ): Promise<CreateContactResponse> {
    return this.createContactUseCase.execute(createContactCommand)
  }
}
```

### create-contact.use-case.ts
```ts
import { DataSource } from 'typeorm'
import { transaction } from '@wisemen/nestjs-typeorm'
import { Injectable } from '@nestjs/common'
import { wiseDate } from '@wisemen/wise-date'
import { DomainEventEmitter } from '../../../../modules/domain-events/domain-event-emitter.js'
import { ContactBuilder } from '../../entities/contact.entity.builder.js'
import { FileNotFoundError } from '../../../../modules/files/errors/file.not-found.error.js'
import { CreateContactCommand } from './create-contact.command.js'
import { CreateContactResponse } from './create-contact.response.js'
import { ContactCreatedEvent } from './contact-created.event.js'
import { CreateContactRepository } from './create-contact.repository.js'

@Injectable()
export class CreateContactUseCase {
  constructor (
    private readonly datasource: DataSource,
    private readonly eventEmitter: DomainEventEmitter,
    private repository: CreateContactRepository
  ) {}

  public async execute (
    command: CreateContactCommand
  ): Promise<CreateContactResponse> {
    if (command.fileUuid != null && !await this.repository.fileExists(command.fileUuid)) {
      throw new FileNotFoundError(command.fileUuid)
    }

    if (command.avatarUuid != null && !await this.repository.fileExists(command.avatarUuid)) {
      throw new FileNotFoundError(command.avatarUuid)
    }

    const contact = new ContactBuilder()
      .withFirstName(command.firstName)
      .withLastName(command.lastName)
      .withEmail(command.email)
      .withPhone(command.phone)
      .withAddress(command.address?.parse() ?? null)
      .withFileUuid(command.fileUuid)
      .withBalance(command.balance?.parse() ?? null)
      .withDiscount(command.discount?.parse() ?? null)
      .withAvatarUuid(command.avatarUuid)
      .withBirthDate(wiseDate(command.birthDate))
      .build()

    const event = new ContactCreatedEvent(contact)

    await transaction(this.datasource, async () => {
      await this.repository.insert(contact)
      await this.eventEmitter.emit([event])
    })

    return new CreateContactResponse(contact)
  }
}
```

### create-contact.command.ts
```ts
import { IsEmail, IsPhoneNumber, IsString, IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { IsDateWithoutTimeString, IsNullable } from '@wisemen/validators'
import { MonetaryDto, IsMonetary, Currency } from '@wisemen/monetary'
import { AddressCommand, IsAddress } from '@wisemen/address'
import { FileUuid } from '../../../../modules/files/entities/file.uuid.js'

export class CreateContactCommand {
  @ApiProperty({ type: String, nullable: true, example: 'John' })
  @IsNullable()
  @IsString()
  firstName: string | null

  @ApiProperty({ type: String, nullable: true, example: 'Doe' })
  @IsNullable()
  @IsString()
  lastName: string | null

  @ApiProperty({ type: String, format: 'email', nullable: true })
  @IsNullable()
  @IsEmail()
  email: string | null

  @ApiProperty({ type: String, format: 'phone', nullable: true, example: '+32473301974' })
  @IsNullable()
  @IsPhoneNumber()
  phone: string | null

  @ApiProperty({ type: AddressCommand, nullable: true })
  @IsNullable()
  @IsAddress()
  address: AddressCommand | null

  @ApiProperty({ type: 'string', nullable: true, format: 'uuid' })
  @IsNullable()
  @IsUUID()
  fileUuid: FileUuid | null

  @ApiProperty({ type: 'string', nullable: true, format: 'uuid' })
  @IsNullable()
  @IsUUID()
  avatarUuid: FileUuid | null

  @ApiProperty({ type: MonetaryDto, nullable: true })
  @IsNullable()
  @IsMonetary({
    allowedCurrencies: new Set([Currency.EUR]),
    maxPrecision: 4,
    minAmount: 0
  })
  discount: MonetaryDto | null

  @ApiProperty({ type: MonetaryDto, nullable: true })
  @IsNullable()
  @IsMonetary({ maxPrecision: 4 })
  balance: MonetaryDto | null

  @ApiProperty({ type: 'string', format: 'date' })
  @IsDateWithoutTimeString()
  @IsNullable()
  birthDate: string | null
}

```

### create-contact.response.ts
```ts
import { Contact } from '../../entities/contact.entity.js'
import { ContactUuid } from '../../entities/contact.uuid.js'

export class CreateContactResponse {
  uuid: ContactUuid

  constructor (contact: Contact) {
    this.uuid = contact.uuid
  }
}
```

### create-contact.repository.ts
```ts
import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { Contact } from '../../entities/contact.entity.js'
import { File } from '../../../../modules/files/entities/file.entity.js'
import { FileUuid } from '../../../../modules/files/entities/file.uuid.js'

export class CreateContactRepository {
  constructor (
    @InjectRepository(Contact) private readonly contactRepo: TypeOrmRepository<Contact>,
    @InjectRepository(File) private readonly fileRepo: TypeOrmRepository<File>
  ) {}

  async fileExists (fileUuid: FileUuid): Promise<boolean> {
    return await this.fileRepo.existsBy({ uuid: fileUuid })
  }

  async insert (contact: Contact): Promise<void> {
    await this.contactRepo.insert(contact)
  }
}
```

### contact-created.event.ts
```ts
import { DomainEventType } from '../../../../modules/domain-events/domain-event-type.js'
import { RegisterDomainEvent } from '../../../../modules/domain-events/register-domain-event.decorator.js'
import { Contact } from '../../entities/contact.entity.js'
import { ContactUuid } from '../../entities/contact.uuid.js'
import { ContactEvent } from '../../events/contact-event.js'

export class ContactCreatedEventContent {
  constructor (readonly contactUuid: ContactUuid) {}
}

@RegisterDomainEvent(DomainEventType.CONTACT_CREATED, 1)
export class ContactCreatedEvent
  extends ContactEvent<ContactCreatedEventContent> {
  constructor (contact: Contact) {
    super({
      contactUuid: contact.uuid,
      content: new ContactCreatedEventContent(contact.uuid)
    })
  }
}
```
