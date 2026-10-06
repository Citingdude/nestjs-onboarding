import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { InjectRepository, TypeOrmRepository, readonly } from '@wisemen/nestjs-typeorm'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { UserNotFoundError } from '#src/modules/auth/users/errors/user-not-found.error.js'

@Injectable()
export class ViewUserDetailUseCase {
  constructor (
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepository: TypeOrmRepository<User>
  ) {}

  async viewUser (withUuid: UserUuid): Promise<User> {
    const user = await readonly(this.dataSource, async () =>
      await this.userRepository.findOne({
        where: { uuid: withUuid },
        relations: { userRoles: { role: true } }
      })
    )

    if (user === null) {
      throw new UserNotFoundError(withUuid)
    }

    return user
  }
}
