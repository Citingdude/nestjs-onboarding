import { Injectable } from '@nestjs/common'
import { InjectRepository, readonly, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { MatchMultiSelect } from '@wisemen/scoped-filter'
import { ViewExportIndexQuery } from './view-export-index.query.js'
import { ViewExportIndexResponse } from './view-export-index.response.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { TYPESENSE_DEFAULT_LIMIT } from '#src/modules/typesense/typesense.constant.js'
import { Export } from '#src/app/export/entities/export.entity.js'

@Injectable()
export class ViewExportIndexUseCase {
  constructor (
    private dataSource: DataSource,
    @InjectRepository(Export) private repository: TypeOrmRepository<Export>
  ) {}

  async execute (
    query: ViewExportIndexQuery,
    userUuid: UserUuid
  ): Promise<ViewExportIndexResponse> {
    const batchSize = query.pagination?.limit ?? TYPESENSE_DEFAULT_LIMIT
    const lastEntity: Partial<Export> | undefined = query.pagination?.key != null
      ? {
          uuid: query.pagination.key.uuid,
          createdAt: new Date(query.pagination.key.createdAt)
        }
      : undefined

    const entities = await readonly(this.dataSource, async () =>
      await this.repository.findNextBatch({
        where: {
          status: MatchMultiSelect(query.filter?.status),
          type: MatchMultiSelect(query.filter?.type),
          requestedByUserUuid: userUuid
        },
        relations: {
          file: true
        },
        order: {
          createdAt: 'DESC',
          uuid: 'DESC'
        }
      }, batchSize, lastEntity)
    )

    return new ViewExportIndexResponse(entities)
  }
}
