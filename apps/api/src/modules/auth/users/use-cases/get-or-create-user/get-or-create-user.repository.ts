import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { Injectable } from '@nestjs/common'
import { User } from '#src/modules/auth/users/entities/user.entity.js'

@Injectable()
export class GetOrCreateUserRepository {
  constructor (
    @InjectRepository(User) private readonly userRepository: TypeOrmRepository<User>
  ) {}

  async findById (id: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ userId: id })
  }

  async insert (user: User): Promise<void> {
    await this.userRepository.insert(user)
  }
}
