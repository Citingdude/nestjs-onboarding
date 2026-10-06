import type { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameNotificationTypeEnum1747403442185 implements MigrationInterface {
  name = 'RenameNotificationTypeEnum1747403442185'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."notification-type" RENAME TO "notification_type"`)
  }

  public async down (_queryRunner: QueryRunner): Promise<void> {}
}
