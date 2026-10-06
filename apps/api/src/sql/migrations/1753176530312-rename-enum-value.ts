import type { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameEnumValue1753176530312 implements MigrationInterface {
  name = 'RenameEnumValue1753176530312'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."notification_type" RENAME VALUE 'test-notification' TO 'system.test-notification'`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."notification_type" RENAME VALUE 'system.test-notification' TO 'test-notification'`)
  }
}
