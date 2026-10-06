import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddDomainEventLogArchive1784817598958 implements MigrationInterface {
  name = 'AddDomainEventLogArchive1784817598958'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "domain_event_log_archive" (
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "range" tstzrange3 NOT NULL,
        "file_uuid" uuid NOT NULL,
        CONSTRAINT "PK_7c84de20530a981f1c3d26d5602" PRIMARY KEY ("uuid")
      )
    `)
    await queryRunner.query(`
      ALTER TABLE "domain_event_log_archive"
      ADD CONSTRAINT "FK_45dc01f9e89d34fd92f5d61d783"
      FOREIGN KEY ("file_uuid") REFERENCES "file"("uuid")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_domain_event_log_archive_range"
      ON "domain_event_log_archive" USING GIST ("range")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_domain_event_log_archive_file_uuid"
      ON "domain_event_log_archive" ("file_uuid")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_domain_event_log_archive_created_at"
      ON "domain_event_log_archive" ("created_at")
    `)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_domain_event_log_archive_created_at"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_domain_event_log_archive_file_uuid"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_domain_event_log_archive_range"`)
    await queryRunner.query(`
      ALTER TABLE "domain_event_log_archive"
      DROP CONSTRAINT "FK_45dc01f9e89d34fd92f5d61d783"
    `)
    await queryRunner.query(`DROP TABLE "domain_event_log_archive"`)
  }
}
