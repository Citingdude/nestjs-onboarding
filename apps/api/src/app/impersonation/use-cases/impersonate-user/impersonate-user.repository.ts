import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@wisemen/nestjs-typeorm'
import { Repository } from 'typeorm'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'

@Injectable()
export class ImpersonateUserRepository {
  constructor (
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}

  async findUser (uuid: UserUuid): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { uuid },
      relations: { userRoles: { role: true } }
    })
  }
}
