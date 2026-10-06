import type { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveDefaultFromFileKey1766569483512 implements MigrationInterface {
  name = 'RemoveDefaultFromFileKey1766569483512'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" ALTER COLUMN "key" DROP DEFAULT`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" ALTER COLUMN "key" SET DEFAULT uuid_generate_v4()`)
  }
}
