import type { MigrationInterface, QueryRunner } from 'typeorm'
import { getMigrationQuery } from '@wisemen/datewise'

export class AddTstzrange31768468951040 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(getMigrationQuery())
  }

  public async down (_queryRunner: QueryRunner): Promise<void> {
  }
}
