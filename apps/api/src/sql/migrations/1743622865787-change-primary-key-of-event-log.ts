import type { MigrationInterface, QueryRunner } from 'typeorm'

export class ChangePrimaryKeyOfEventLog1743622865787 implements MigrationInterface {
  name = 'ChangePrimaryKeyOfEventLog1743622865787'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "domain_event_log" DROP CONSTRAINT "PK_be3d64655b9bdc08a284764eff7"`)
    await queryRunner.query(`ALTER TABLE "domain_event_log" ADD CONSTRAINT "PK_be3d64655b9bdc08a284764eff7" PRIMARY KEY ("created_at", "uuid")`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "domain_event_log" DROP CONSTRAINT "PK_be3d64655b9bdc08a284764eff7"`)
    await queryRunner.query(`ALTER TABLE "domain_event_log" ADD CONSTRAINT "PK_be3d64655b9bdc08a284764eff7" PRIMARY KEY ("created_at")`)
  }
}
