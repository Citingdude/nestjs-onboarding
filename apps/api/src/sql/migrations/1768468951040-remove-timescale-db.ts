import type { MigrationInterface, QueryRunner } from 'typeorm'

export class DropTimescaledbExtension1768468951040 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP EXTENSION IF EXISTS timescaledb`)
  }

  public async down (_queryRunner: QueryRunner): Promise<void> {
  }
}
