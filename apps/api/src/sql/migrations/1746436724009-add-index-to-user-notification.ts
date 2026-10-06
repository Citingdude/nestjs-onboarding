import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddIndexToUserNotification1746436724009 implements MigrationInterface {
  name = 'AddIndexToUserNotification1746436724009'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE INDEX "IDX_cf4a86d1f8bf57fc51a17e3a40" 
        ON "user_notification" ("user_uuid", "channel", "read_at") 
        WHERE channel = 'app' AND read_at IS NULL
    `)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_cf4a86d1f8bf57fc51a17e3a40"`)
  }
}
