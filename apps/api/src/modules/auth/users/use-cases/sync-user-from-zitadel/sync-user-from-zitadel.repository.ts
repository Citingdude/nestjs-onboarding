import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

@Injectable()
export class SyncUserFromZitadelRepository {
  constructor (
    @InjectRepository(User)
    private readonly userRepository: TypeOrmRepository<User>
  ) {}

  async findUser (userUuid: UserUuid): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { uuid: userUuid }
    })
  }

  async updateUserNames (
    userUuid: UserUuid,
    firstName: string | null,
    lastName: string | null
  ): Promise<void> {
    await this.userRepository.update({ uuid: userUuid }, { firstName, lastName })
  }
}
