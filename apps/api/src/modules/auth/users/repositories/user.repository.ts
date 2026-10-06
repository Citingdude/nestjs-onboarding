import { EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

@Injectable()
export class UserRepository extends TypeOrmRepository<User> {
  constructor (entityManager: EntityManager) {
    super(User, entityManager)
  }

  async findWithUuids (
    userUuids: UserUuid[]
  ): Promise<User[]> {
    if (userUuids.length === 0) return []
    const usersQuery = this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .andWhere('user.uuid IN (:...userUuids)', { userUuids })

    return await usersQuery.getMany()
  }
}
