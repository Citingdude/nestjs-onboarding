import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddEventLogTable1741897870440 implements MigrationInterface {
  name = 'AddEventLogTable1741897870440'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "domain_event_log"
        (
            "created_at"   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "uuid"         uuid                     NOT NULL DEFAULT uuid_generate_v4(),
            "topic"        character varying        NOT NULL,
            "version"      integer                  NOT NULL,
            "source"       character varying        NOT NULL,
            "type"         character varying        NOT NULL,
            "content"      jsonb                    NOT NULL,
            "user_uuid"    uuid,
            "trace_id"     character varying,
            "subject_type" character varying,
            "subject_id"   uuid,
            CONSTRAINT "PK_be3d64655b9bdc08a284764eff7" PRIMARY KEY ("created_at")
        )`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "domain_event_log"`)
  }
}
