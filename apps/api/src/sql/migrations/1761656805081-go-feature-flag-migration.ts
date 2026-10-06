import type { MigrationInterface, QueryRunner } from 'typeorm'

export class GoFeatureFlagMigration1761656805081 implements MigrationInterface {
  name = 'GoFeatureFlagMigration1761656805081'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    await queryRunner.query(`CREATE TABLE "feature_flag" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "flag_name" character varying(255) NOT NULL, "flagset" character varying(255) NOT NULL, "config" jsonb NOT NULL, CONSTRAINT "UQ_609e425cccb0f775e63c4a2b3b1" UNIQUE ("flag_name", "flagset"), CONSTRAINT "PK_d66cc4ccb6b65ff531c90e3e427" PRIMARY KEY ("uuid"))`)
    await queryRunner.query(`CREATE INDEX "IDX_486882550e8b66e56bf24fed86" ON "feature_flag" ("flag_name") `)
    await queryRunner.query(`CREATE INDEX "IDX_6da1f5f738e3e5326eebea898d" ON "feature_flag" ("flagset") `)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_6da1f5f738e3e5326eebea898d"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_486882550e8b66e56bf24fed86"`)
    await queryRunner.query(`DROP TABLE "feature_flag"`)
  }
}
