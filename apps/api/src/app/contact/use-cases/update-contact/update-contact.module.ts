import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { UpdateContactUseCase } from './update-contact.use-case.js'
import { UpdateContactController } from './update-contact.controller.js'
import { UpdateContactRepository } from './update-contact.repository.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import { Contact } from '#src/app/contact/entities/contact.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact, File])
  ],
  controllers: [
    UpdateContactController
  ],
  providers: [
    UpdateContactUseCase,
    UpdateContactRepository
  ]
})
export class UpdateContactModule { }
