import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddBlurHashOnFile1752742757582 implements MigrationInterface {
  name = 'AddBlurHashOnFile1752742757582'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" ADD "blur_hash" character varying`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "blur_hash"`)
  }
}
