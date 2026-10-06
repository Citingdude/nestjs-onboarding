import type { MigrationInterface, QueryRunner } from 'typeorm'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'

export const roles = [
  {
    name: 'system admin',
    permissions: [Permission.ALL_PERMISSIONS],
    isDefault: false,
    isSystemAdmin: true
  },
  {
    name: 'default',
    permissions: [],
    isDefault: true,
    isSystemAdmin: false
  }
]

export class RolePermissions1738686978864 implements MigrationInterface {
  name = 'RolePermissions1738686978864'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.upsert(Role, roles, ['name'])
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(Role, [{ isDefault: true }, { isSystemAdmin: true }])
  }
}
