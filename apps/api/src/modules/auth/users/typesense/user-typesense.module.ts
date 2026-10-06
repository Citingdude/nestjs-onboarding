import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { UserTypesenseCollector } from './user-typesense.collector.js'
import { UserGlobalSearchCollection } from './user.global-search.collection.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([User])
  ],
  providers: [
    UserTypesenseCollector,
    UserGlobalSearchCollection
  ]
})
export class TypesenseUserModule {}
