import { Injectable } from '@nestjs/common'
import { InjectRepository, readonly, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { DataSource, ILike, IsNull, type FindOptionsWhere } from 'typeorm'
import { ViewApiKeyIndexQuery } from './view-api-key-index.query.js'
import { ViewApiKeyIndexResponse } from './view-api-key-index.response.js'
import { ApiKey } from '#src/modules/auth/api-key/entities/api-key.entity.js'
import { TYPESENSE_DEFAULT_LIMIT } from '#src/modules/typesense/typesense.constant.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { AuthPrincipal } from '#src/modules/auth/authentication/auth-principal.type.js'
import type { PermissionSet } from '#src/modules/auth/permission/permission-set.js'

@Injectable()
export class ViewApiKeyIndexUseCase {
  constructor (
    private dataSource: DataSource,
    @InjectRepository(ApiKey)
    private repository: TypeOrmRepository<ApiKey>
  ) { }

  async execute (
    query: ViewApiKeyIndexQuery,
    auth: AuthPrincipal,
    permissions: PermissionSet
  ): Promise<ViewApiKeyIndexResponse> {
    const batchSize = query.pagination?.limit ?? TYPESENSE_DEFAULT_LIMIT
    const lastEntity = query.pagination?.key != null
      ? {
          createdAt: new Date(query.pagination.key.createdAt),
          uuid: query.pagination.key.uuid
        }
      : undefined

    const where: FindOptionsWhere<ApiKey> = {
      deletedAt: IsNull()
    }

    const canReadAll = permissions.hasAny([Permission.API_KEY_READ])

    if (!canReadAll) {
      where.userUuid = auth.userUuid
    }

    if (query.search != null && query.search !== '') {
      where.name = ILike(`%${query.search}%`)
    }

    const items = await readonly(this.dataSource, async () =>
      await this.repository.findNextBatch({
        where,
        order: {
          createdAt: 'DESC',
          uuid: 'DESC'
        },
        relations: {
          user: true
        }
      }, batchSize, lastEntity)
    )

    return new ViewApiKeyIndexResponse(items)
  }
}
