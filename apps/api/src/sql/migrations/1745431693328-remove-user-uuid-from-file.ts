import type { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveUserUuidFromFile1745431693328 implements MigrationInterface {
  name = 'RemoveUserUuidFromFile1745431693328'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "user_uuid"`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" ADD "user_uuid" uuid`)
  }
}
