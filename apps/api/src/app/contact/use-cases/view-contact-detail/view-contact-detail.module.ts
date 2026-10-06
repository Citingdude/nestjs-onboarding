import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ViewContactDetailUseCase } from './view-contact-detail.use-case.js'
import { ViewContactDetailController } from './view-contact-detail.controller.js'
import { FilePresignerModule } from '#src/modules/files/modules/file-presigner/file-presigner.module.js'
import { Contact } from '#src/app/contact/entities/contact.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact]),
    FilePresignerModule
  ],
  controllers: [
    ViewContactDetailController
  ],
  providers: [
    ViewContactDetailUseCase
  ]
})
export class ViewContactDetailModule { }
