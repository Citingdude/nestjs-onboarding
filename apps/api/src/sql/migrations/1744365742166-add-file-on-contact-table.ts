import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFileOnContactTable1744365742166 implements MigrationInterface {
  name = 'AddFileOnContactTable1744365742166'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contact" ADD "file_uuid" uuid`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "file_uuid"`)
  }
}
