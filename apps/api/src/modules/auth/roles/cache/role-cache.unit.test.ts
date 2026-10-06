import { describe, it } from 'node:test'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { expect } from 'expect'
import { createStubInstance } from 'sinon'
import { RedisClient } from '@wisemen/nestjs-redis'
import { generateUuid } from '@wisemen/nestjs-common'
import { RoleCache } from './role-cache.js'
import type { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'
import { RoleBuilder } from '#src/modules/auth/roles/entities/role.entity.builder.js'

describe('Role cache unit test', () => {
  describe('Resetting role permissions', () => {
    it('Should fail when redis throws an error', () => {
      const redisClient = createStubInstance(RedisClient)
      const roleRepository = createStubInstance(TypeOrmRepository<Role>)

      const roleCache = new RoleCache(redisClient, roleRepository)

      redisClient.deleteCachedValues.rejects(new Error('Redis is down'))

      const promise = roleCache.clearRolesPermissions([generateUuid<RoleUuid>()])

      expect(promise).rejects.toThrow()
    })

    it('Should succeed in clearing roles', () => {
      const redisClient = createStubInstance(RedisClient)
      const roleRepository = createStubInstance(TypeOrmRepository<Role>)

      const roleCache = new RoleCache(redisClient, roleRepository)

      redisClient.deleteCachedValues.resolves()

      const promise = roleCache.clearRolesPermissions([generateUuid<RoleUuid>()])

      expect(promise).resolves.not.toThrow()
    })
  })

  describe('Retrieving role permissions', () => {
    it('Should return permissions when redis has no cache', async () => {
      const redisClient = createStubInstance(RedisClient)
      const roleRepository = createStubInstance(TypeOrmRepository<Role>)

      const roleCache = new RoleCache(redisClient, roleRepository)

      const role = new RoleBuilder()
        .withPermissions([])
        .build()

      redisClient.getCachedValues.resolves([null])
      roleRepository.findBy.resolves([role])

      const permissions = await roleCache.getRolesPermissions([role.uuid])

      expect(permissions).toEqual(role.permissions)
    })

    it('Should return permissions when redis is functioning', async () => {
      const redisClient = createStubInstance(RedisClient)
      const roleRepository = createStubInstance(TypeOrmRepository<Role>)

      const roleCache = new RoleCache(redisClient, roleRepository)

      const role = new RoleBuilder()
        .withPermissions([])
        .build()

      redisClient.getCachedValues.resolves([role.permissions])

      const permissions = await roleCache.getRolesPermissions([role.uuid])

      expect(permissions).toEqual(role.permissions)
    })

    it('Should return all permissions when partial roles are cached', async () => {
      const redisClient = createStubInstance(RedisClient)
      const roleRepository = createStubInstance(TypeOrmRepository<Role>)

      const roleCache = new RoleCache(redisClient, roleRepository)

      const contactRole = new RoleBuilder()
        .withPermissions([Permission.CONTACT_READ])
        .build()

      const userRole = new RoleBuilder()
        .withPermissions([Permission.USER_READ])
        .build()

      const values = [contactRole.permissions, null]

      redisClient.getCachedValues.resolves(values)
      roleRepository.findBy.resolves([userRole])

      const permissions = await roleCache.getRolesPermissions([contactRole.uuid, userRole.uuid])
      const expectedPermissions = [...contactRole.permissions, ...userRole.permissions]

      expect(permissions).toEqual(expectedPermissions)
    })
  })
})
