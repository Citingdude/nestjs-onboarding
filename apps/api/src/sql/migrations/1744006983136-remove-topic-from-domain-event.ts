import type { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveTopicFromDomainEvent1744006983136 implements MigrationInterface {
  name = 'RemoveTopicFromDomainEvent1744006983136'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "domain_event_log" DROP COLUMN "topic"`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "domain_event_log" ADD "topic" character varying NOT NULL`)
  }
}
