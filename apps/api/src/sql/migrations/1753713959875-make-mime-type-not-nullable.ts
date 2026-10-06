import type { MigrationInterface, QueryRunner } from 'typeorm'

export class MakeMimeTypeNotNullable1753713959875 implements MigrationInterface {
  name = 'MakeMimeTypeNotNullable1753713959875'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "file" SET "mime_type" = 'application/octet-stream' WHERE "mime_type" IS NULL`)
    await queryRunner.query(`ALTER TABLE "file" ALTER COLUMN "mime_type" SET NOT NULL`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" ALTER COLUMN "mime_type" DROP NOT NULL`)
  }
}
