/* eslint-disable no-console */
import { Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { DataSource } from 'typeorm'
import { DefaultConfigModule } from '#src/modules/config/default-config.module.js'
import { DefaultTypeOrmModule } from '#src/modules/typeorm/default-typeorm.module.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import { UserRole } from '#src/modules/auth/roles/entities/user-role.entity.js'
import { UserRoleCacheModule } from '#src/modules/auth/users/cache/user-role/user-role-cache.module.js'
import { UserRoleCache } from '#src/modules/auth/users/cache/user-role/user-role-cache.js'

@Module({
  imports: [
    DefaultConfigModule,
    DefaultTypeOrmModule.forRootAsync({ migrationsRun: false }),
    UserRoleCacheModule
  ]
})
class InsertLocalTestUserModule {}

const args = await yargs(hideBin(process.argv))
  .option('user-id', {
    type: 'string',
    demandOption: true,
    description: 'Zitadel user ID'
  })
  .option('email', {
    type: 'string',
    demandOption: true,
    description: 'User email address'
  })
  .strict()
  .parse()

async function insertLocalTestUser (): Promise<void> {
  const app = await NestFactory.createApplicationContext(InsertLocalTestUserModule, {
    logger: ['error', 'warn']
  })

  try {
    const dataSource = app.get(DataSource)
    const userRoleCache = app.get(UserRoleCache)

    const result = await dataSource.transaction(async (manager) => {
      const role = await manager.getRepository(Role).findOneBy({
        name: 'system admin',
        isSystemAdmin: true
      })

      if (role == null) {
        throw new Error('The seeded system admin role was not found.')
      }

      const userRepository = manager.getRepository(User)
      const existingUser = await userRepository.findOneBy({ userId: args.userId })
      const userWasCreated = existingUser == null
      let userUuid = existingUser?.uuid

      if (userUuid == null) {
        const insertResult = await userRepository.insert({
          userId: args.userId,
          email: args.email,
          firstName: null,
          lastName: null
        })

        userUuid = insertResult.identifiers[0]?.uuid as UserUuid | undefined
      }

      if (userUuid == null) {
        throw new Error('The inserted user did not return a UUID.')
      }

      const userRoleRepository = manager.getRepository(UserRole)
      const userRoleExists = await userRoleRepository.existsBy({
        userUuid,
        roleUuid: role.uuid
      })

      if (!userRoleExists) {
        await userRoleRepository.insert({
          userUuid,
          roleUuid: role.uuid
        })
      }

      return { userUuid, userWasCreated, userRoleWasCreated: !userRoleExists }
    })

    await userRoleCache.clearUserRoles([result.userUuid])

    if (!result.userWasCreated && !result.userRoleWasCreated) {
      console.log(`System admin role is already assigned to user ${result.userUuid}; cleared the user role cache.`)
    } else if (result.userWasCreated) {
      console.log(`Created system admin user ${result.userUuid} for ${args.email} and cleared the user role cache.`)
    } else {
      console.log(`Assigned the system admin role to existing user ${result.userUuid} and cleared the user role cache.`)
    }
  } finally {
    await app.close()
  }
}

insertLocalTestUser().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
