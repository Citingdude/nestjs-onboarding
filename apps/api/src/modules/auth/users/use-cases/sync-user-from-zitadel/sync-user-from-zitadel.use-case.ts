import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { transaction } from '@wisemen/nestjs-typeorm'
import type { User as ZitadelUser } from '@zitadel/proto/zitadel/user/v2/user_pb.js'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { ZitadelClient, ZitadelNotFoundError } from '@wisemen/nestjs-zitadel'
import { SyncUserFromZitadelRepository } from './sync-user-from-zitadel.repository.js'
import { UserUpdatedEvent } from './user-updated.event.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

@Injectable()
export class SyncUserFromZitadelUseCase {
  constructor (
    private readonly dataSource: DataSource,
    private readonly zitadelClient: ZitadelClient,
    private readonly repository: SyncUserFromZitadelRepository,
    private readonly domainEventEmitter: DomainEventEmitter
  ) {}

  async execute (userUuid: UserUuid): Promise<void> {
    const user = await this.repository.findUser(userUuid)

    if (user == null) {
      return
    }

    const zitadelUser = await this.fetchZitadelUser(user.userId)

    if (zitadelUser == null) {
      return
    }

    const { firstName, lastName } = this.mapNames(zitadelUser)

    if (firstName === user.firstName && lastName === user.lastName) {
      return
    }

    await transaction(this.dataSource, async () => {
      await this.repository.updateUserNames(user.uuid, firstName, lastName)
      await this.domainEventEmitter.emitOne(
        new UserUpdatedEvent(user.uuid, firstName, lastName)
      )
    })
  }

  private async fetchZitadelUser (
    userId: string
  ): Promise<ZitadelUser | null> {
    try {
      const response = await this.zitadelClient.userClient.getUserByID({ userId })

      return response.user ?? null
    } catch (error) {
      if (error instanceof ZitadelNotFoundError) {
        return null
      }

      throw error
    }
  }

  private mapNames (user: ZitadelUser): { firstName: string | null, lastName: string | null } {
    if (user.type.case === 'human') {
      const human = user.type.value

      return {
        firstName: human.profile?.givenName ?? null,
        lastName: human.profile?.familyName ?? null
      }
    }

    if (user.type.case === 'machine') {
      return {
        firstName: user.type.value.name,
        lastName: null
      }
    }

    return {
      firstName: null,
      lastName: null
    }
  }
}
