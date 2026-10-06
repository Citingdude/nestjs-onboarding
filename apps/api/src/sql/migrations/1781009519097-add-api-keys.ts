import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddApiKeys1781009519097 implements MigrationInterface {
  name = 'AddApiKeys1781009519097'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "api_key" (
      "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), 
      "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(), 
      "deleted_at" TIMESTAMP(3) WITH TIME ZONE, 
      "expires_at" TIMESTAMP(3) WITH TIME ZONE, 
      "name" character varying NOT NULL, 
      "permissions" character varying array NOT NULL DEFAULT '{}', 
      "secret_hash" character varying NOT NULL, 
      "secret_last_chars" character varying NOT NULL, 
      "user_uuid" uuid NOT NULL, 
      "created_by_user_uuid" uuid, 
      CONSTRAINT "UQ_b227edd98d489363d65e908e60f" UNIQUE ("secret_hash"), 
      CONSTRAINT "PK_f07cf6dbb3ed3600a5511578f81" PRIMARY KEY ("uuid")
    )`)
    await queryRunner.query(`
      ALTER TABLE "api_key" 
      ADD CONSTRAINT "FK_a7c82f9b1d8fc129342dbcbb806" 
      FOREIGN KEY ("created_by_user_uuid") REFERENCES "user"("uuid") 
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION
    `)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api_key" DROP CONSTRAINT "FK_a7c82f9b1d8fc129342dbcbb806"`)
    await queryRunner.query(`DROP TABLE "api_key"`)
  }
}
