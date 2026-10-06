import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddIsPublicOnFile1763717837758 implements MigrationInterface {
  name = 'AddIsPublicOnFile1763717837758'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" ADD "is_public" boolean NOT NULL DEFAULT false`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "is_public"`)
  }
}
