import { describe, it } from 'node:test'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { expect } from 'expect'
import { createStubInstance } from 'sinon'
import { RedisClient } from '@wisemen/nestjs-redis'
import { generateUuid } from '@wisemen/nestjs-common'
import { UserRoleCache } from './user-role-cache.js'
import type { User } from '#src/modules/auth/users/entities/user.entity.js'
import { UserBuilder } from '#src/modules/auth/users/entities/user.entity.builder.js'
import { UserRoleBuilder } from '#src/modules/auth/roles/entities/user-role.entity.builder.js'

describe('User cache unit test', () => {
  describe('Set user roles', () => {
    it('Should fail when redis throws an error', () => {
      const redisClient = createStubInstance(RedisClient)
      const userRepository = createStubInstance(TypeOrmRepository<User>)

      const userCache = new UserRoleCache(redisClient, userRepository)

      redisClient.putCachedValue.rejects(new Error('Redis is down'))

      const promise = userCache.setUserRoles(generateUuid(), [generateUuid()])

      expect(promise).rejects.toThrow()
    })

    it('Should succeed in setting user roles', () => {
      const redisClient = createStubInstance(RedisClient)
      const userRepository = createStubInstance(TypeOrmRepository<User>)

      const userCache = new UserRoleCache(redisClient, userRepository)

      redisClient.putCachedValue.resolves()

      const promise = userCache.setUserRoles(generateUuid(), [generateUuid()])

      expect(promise).resolves.not.toThrow()
    })
  })

  describe('Get user roles', () => {
    it('Should return roles when redis has no cache', async () => {
      const redisClient = createStubInstance(RedisClient)
      const userRepository = createStubInstance(TypeOrmRepository<User>)

      const userCache = new UserRoleCache(redisClient, userRepository)

      const userRole = new UserRoleBuilder().build()
      const user = new UserBuilder().build()

      user.userRoles = [userRole]

      redisClient.getCachedValue.resolves(null)
      userRepository.findOne.resolves(user)

      const roles = await userCache.getUserRoles(user.uuid)

      expect(roles).toEqual([userRole.roleUuid])
    })

    it('Should return roles when redis is functioning', async () => {
      const redisClient = createStubInstance(RedisClient)
      const userRepository = createStubInstance(TypeOrmRepository<User>)

      const userCache = new UserRoleCache(redisClient, userRepository)

      const userRole = new UserRoleBuilder().build()
      const user = new UserBuilder().build()

      user.userRoles = [userRole]

      redisClient.getCachedValue.resolves([userRole.roleUuid])

      const roles = await userCache.getUserRoles(user.uuid)

      expect(roles).toEqual([userRole.roleUuid])
    })
  })
})
