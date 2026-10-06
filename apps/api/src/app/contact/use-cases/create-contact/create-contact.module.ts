import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { CreateContactUseCase } from './create-contact.use-case.js'
import { CreateContactController } from './create-contact.controller.js'
import { CreateContactRepository } from './create-contact.repository.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import { Contact } from '#src/app/contact/entities/contact.entity.js'

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
