import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ContactTypesenseCollector } from './contact.typesense-collector.js'
import { ContactGlobalSearchCollection } from './contact.global-search.collection.js'
import { Contact } from '#src/app/contact/entities/contact.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact])
  ],
  providers: [
    ContactTypesenseCollector,
    ContactGlobalSearchCollection
  ]
})
export class TypesenseContactModule {}
