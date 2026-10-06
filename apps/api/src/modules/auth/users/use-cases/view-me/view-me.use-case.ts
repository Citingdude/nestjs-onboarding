import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository, readonly } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { UserNotFoundError } from '#src/modules/auth/users/errors/user-not-found.error.js'

@Injectable()
export class ViewMeUseCase {
  constructor (
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepository: TypeOrmRepository<User>
  ) {}

  async viewMe (uuid: UserUuid): Promise<User> {
    const user = await readonly(this.dataSource, async () =>
      await this.userRepository.findOne({
        where: { uuid },
        relations: { userRoles: { role: true } }
      })
    )

    if (user === null) {
      throw new UserNotFoundError(uuid)
    }

    return user
  }
}
