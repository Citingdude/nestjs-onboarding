import { Injectable } from '@nestjs/common'
import { readonly } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { ViewUserIndexRepository } from './view-user-index.repository.js'
import type { ViewUserIndexQuery } from './view-user-index.query.js'
import { ViewUserIndexResponse } from './view-user-index.response.js'

@Injectable()
export class ViewUserIndexUseCase {
  constructor (
    private readonly dataSource: DataSource,
    private readonly repository: ViewUserIndexRepository
  ) {}

  async viewUsers (query: ViewUserIndexQuery): Promise<ViewUserIndexResponse> {
    const [users, userRoles] = await readonly(this.dataSource, async () => {
      const users = await this.repository.searchUsers(query)
      const userUuids = users.items.map(user => user.id)
      const userRoles = await this.repository.fetchUserRoles(userUuids)

      return [users, userRoles] as const
    })

    return new ViewUserIndexResponse(users, userRoles)
  }
}
