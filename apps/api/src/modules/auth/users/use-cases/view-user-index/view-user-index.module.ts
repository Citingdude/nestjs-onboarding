import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ViewUserIndexRepository } from './view-user-index.repository.js'
import { ViewUserIndexController } from './view-user-index.controller.js'
import { ViewUserIndexUseCase } from './view-user-index.use-case.js'
import { UserRole } from '#src/modules/auth/roles/entities/user-role.entity.js'
import { TypesenseModule } from '#src/modules/typesense/typesense.module.js'

@Module({
  imports: [
    TypesenseModule,
    TypeOrmModule.forFeature([UserRole])
  ],
  controllers: [ViewUserIndexController],
  providers: [ViewUserIndexUseCase, ViewUserIndexRepository]
})
export class ViewUserIndexModule {}
