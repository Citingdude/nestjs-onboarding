import type { MigrationInterface, QueryRunner } from 'typeorm'

export class DomainEventLogActor1790678686000 implements MigrationInterface {
  name = 'DomainEventLogActor1790678686000'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "domain_event_log" ADD "actor_type" character varying`)
    await queryRunner.query(`ALTER TABLE "domain_event_log" ADD "actor_id" character varying`)
    await queryRunner.query(`
      UPDATE "domain_event_log"
      SET "actor_type" = 'user', "actor_id" = "user_uuid"::character varying
      WHERE "user_uuid" IS NOT NULL
    `)
    await queryRunner.query(`ALTER TABLE "domain_event_log" DROP COLUMN "user_uuid"`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "domain_event_log" ADD "user_uuid" uuid`)
    await queryRunner.query(`
      UPDATE "domain_event_log"
      SET "user_uuid" = "actor_id"::uuid
      WHERE "actor_type" = 'user'
    `)
    await queryRunner.query(`ALTER TABLE "domain_event_log" DROP COLUMN "actor_id"`)
    await queryRunner.query(`ALTER TABLE "domain_event_log" DROP COLUMN "actor_type"`)
  }
}
