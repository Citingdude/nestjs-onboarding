import { AnyOrIgnore, InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { MoreThanOrEqual } from 'typeorm'
import { RegisterTypesenseCollector, type TypesenseCollector } from '@wisemen/nestjs-typesense'
import type { TypesenseUser, UserCollection } from './user.typesense-collection.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'

@RegisterTypesenseCollector(TypesenseCollectionName.USER)
export class UserTypesenseCollector implements TypesenseCollector<UserCollection> {
  static readonly BATCH_SIZE = 10000

  constructor (
    @InjectRepository(User) private readonly userRepository: TypeOrmRepository<User>
  ) {}

  transform (users: User[]): TypesenseUser[] {
    return users.map(user => this.transformUser(user))
  }

  fetch (uuids?: UserUuid[]): AsyncGenerator<User[], void, void> {
    return this.userRepository.findInBatches({
      where: { uuid: AnyOrIgnore(uuids) },
      relations: { userRoles: { role: true } }
    }, UserTypesenseCollector.BATCH_SIZE)
  }

  fetchChanged (since: Date): AsyncGenerator<User[], void, void> {
    return this.userRepository.findInBatches({
      where: [
        { updatedAt: MoreThanOrEqual(since) },
        { userRoles: { role: { updatedAt: MoreThanOrEqual(since) } } }
      ],
      relations: { userRoles: { role: true } }
    }, UserTypesenseCollector.BATCH_SIZE)
  }

  private transformUser (user: User): TypesenseUser {
    return {
      id: user.uuid,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      email: user.email
    }
  }
}
