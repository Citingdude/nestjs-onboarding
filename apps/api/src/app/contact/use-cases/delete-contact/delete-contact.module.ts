import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { DeleteContactUseCase } from './delete-contact.use-case.js'
import { DeleteContactController } from './delete-contact.controller.js'
import { Contact } from '#src/app/contact/entities/contact.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact])
  ],
  controllers: [
    DeleteContactController
  ],
  providers: [
    DeleteContactUseCase
  ]
})
export class DeleteContactModule { }
