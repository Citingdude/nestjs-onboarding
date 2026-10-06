import { Injectable } from '@nestjs/common'
import { PaginatedOffsetResponse } from '@wisemen/pagination'
import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { Any } from 'typeorm'
import { Typesense, TypesenseClient } from '@wisemen/nestjs-typesense'
import type { ViewUserIndexQuery } from './view-user-index.query.js'
import { UserCollection, type TypesenseUser } from '#src/modules/auth/users/typesense/user.typesense-collection.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import { UserRole } from '#src/modules/auth/roles/entities/user-role.entity.js'

@Injectable()
export class ViewUserIndexRepository {
  constructor (
    private typesenseClient: TypesenseClient,
    @InjectRepository(UserRole) private userRoleRepo: TypeOrmRepository<UserRole>
  ) {}

  async searchUsers (query: ViewUserIndexQuery): Promise<PaginatedOffsetResponse<TypesenseUser>> {
    const typesenseSearchParams = Typesense.createSearchParamsBuilder(UserCollection)
      .withQuery(query.search)
      .withOffset(query.pagination?.offset)
      .withLimit(query.pagination?.limit)
      .addSearchOn(UserCollection.firstName)
      .addSearchOn(UserCollection.lastName)
      .addSearchOn(UserCollection.email)
      .build()

    return await this.typesenseClient.search(UserCollection, typesenseSearchParams)
  }

  async fetchUserRoles (userUuids: UserUuid[]): Promise<Map<UserUuid, Role[]>> {
    if (userUuids.length === 0) {
      return new Map()
    }

    const userRoles = await this.userRoleRepo.find({
      where: { userUuid: Any(userUuids) },
      relations: { role: true }
    })

    const result = new Map<UserUuid, Role[]>()
    for (const userRole of userRoles) {
      const roles = result.get(userRole.userUuid) ?? []
      roles.push(userRole.role!)
      result.set(userRole.userUuid, roles)
    }

    return result
  }
}
