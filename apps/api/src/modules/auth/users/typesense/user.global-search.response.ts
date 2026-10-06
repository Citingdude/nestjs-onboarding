import { ApiProperty } from '@nestjs/swagger'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import type { TypesenseUser } from '#src/modules/auth/users/typesense/user.typesense-collection.js'

export class UserGlobalSearchResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  uuid: UserUuid

  @ApiProperty()
  name: string

  @ApiProperty({ type: String, format: 'email' })
  email: string

  constructor (user: TypesenseUser) {
    this.uuid = user.id
    this.name = user.firstName + ' ' + user.lastName
    this.email = user.email
  }
}
