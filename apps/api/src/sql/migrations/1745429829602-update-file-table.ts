import type { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateFileTable1745429829602 implements MigrationInterface {
  name = 'UpdateFileTable1745429829602'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" ADD "key" character varying NOT NULL DEFAULT uuid_generate_v4()`)
    await queryRunner.query(`UPDATE file SET key = uuid::varchar`)

    await queryRunner.query(`ALTER TABLE "file" ADD "variants" jsonb NOT NULL DEFAULT '[]'`)

    await queryRunner.query(`ALTER TABLE "file" ADD "created_at_new" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`UPDATE file SET created_at_new = created_at::timestamptz`)
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "file" RENAME COLUMN "created_at_new" TO created_at`)

    await queryRunner.query(`ALTER TABLE "file" ADD "updated_at_new" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`UPDATE file SET updated_at_new = updated_at::timestamptz`)
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "file" RENAME COLUMN "updated_at_new" TO updated_at`)

    await queryRunner.query(`ALTER TABLE "file" ADD "deleted_at_new" TIMESTAMP WITH TIME ZONE`)
    await queryRunner.query(`UPDATE file SET deleted_at_new = deleted_at::timestamptz`)
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "deleted_at"`)
    await queryRunner.query(`ALTER TABLE "file" RENAME COLUMN "deleted_at_new" TO deleted_at`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "deleted_at"`)
    await queryRunner.query(`ALTER TABLE "file" ADD "deleted_at" TIMESTAMP(3)`)
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "file" ADD "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now()`)
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "file" ADD "created_at" TIMESTAMP(3) NOT NULL DEFAULT now()`)
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "variants"`)
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "key"`)
  }
}
