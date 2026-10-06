import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ViewContactIndexUseCase } from './view-contact-index.use-case.js'
import { ViewContactIndexController } from './view-contact-index.controller.js'
import { Contact } from '#src/app/contact/entities/contact.entity.js'
import { TypesenseModule } from '#src/modules/typesense/typesense.module.js'

@Module({
  imports: [
    TypesenseModule,
    TypeOrmModule.forFeature([Contact])
  ],
  controllers: [
    ViewContactIndexController
  ],
  providers: [
    ViewContactIndexUseCase
  ]
})
export class ViewContactIndexModule { }
