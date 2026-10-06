import { Injectable } from '@nestjs/common'
import { Subscribe } from '@wisemen/nestjs-domain-events'
import { AssignDefaultRoleToUserUseCase } from './assign-default-role-to-user.use-case.js'
import { UserCreatedEvent } from '#src/modules/auth/users/use-cases/get-or-create-user/user-created.event.js'

@Injectable()
export class AssignDefaultRoleToUserSubscriber {
  constructor (
    private readonly useCase: AssignDefaultRoleToUserUseCase
  ) {}

  @Subscribe(UserCreatedEvent)
  async assignDefaultRole (events: UserCreatedEvent[]): Promise<void> {
    const userUuids = events.map(event => event.content.userUuid)
    await this.useCase.assignDefaultRole(userUuids)
  }
}
