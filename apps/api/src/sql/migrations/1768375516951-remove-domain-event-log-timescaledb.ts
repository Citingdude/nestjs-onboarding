import type { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveDomainEventLogHypertable1768375516951 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE domain_event_log_new (LIKE domain_event_log INCLUDING ALL)`)
    await queryRunner.query(`INSERT INTO domain_event_log_new SELECT * FROM domain_event_log`)
    await queryRunner.query(`DROP TABLE domain_event_log`)
    await queryRunner.query(`ALTER TABLE domain_event_log_new RENAME TO domain_event_log`)
  }

  public async down (_queryRunner: QueryRunner): Promise<void> {}
}
