import type { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialMigration1733385371621 implements MigrationInterface {
  name = 'InitialMigration1733385371621'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`)
    await queryRunner.query(`
            CREATE TABLE "file_link"
            (
                "uuid"        uuid              NOT NULL DEFAULT uuid_generate_v4(),
                "created_at"  TIMESTAMP(3)      NOT NULL DEFAULT now(),
                "updated_at"  TIMESTAMP(3)      NOT NULL DEFAULT now(),
                "file_uuid"   uuid              NOT NULL,
                "entity_type" character varying NOT NULL,
                "entity_uuid" uuid              NOT NULL,
                "entity_part" character varying NOT NULL,
                "order"       smallint,
                CONSTRAINT "PK_b6d7dfcebc6f25ae6e0ac6050cc" PRIMARY KEY ("uuid")
            )`)
    await queryRunner.query(` CREATE INDEX "IDX_fd4d9563fa6540cd443f3a6855" ON "file_link" ("file_uuid") `)
    await queryRunner.query(`CREATE INDEX "IDX_c75bfa9854abb1f61362722ebb" ON "file_link" ("entity_uuid") `)
    await queryRunner.query(`CREATE INDEX "IDX_79ce5ff400cb1d853fd6a800d6" ON "file_link" ("entity_part") `)
    await queryRunner.query(`CREATE INDEX "IDX_fe44eb53fd9da12f87f1b11697" ON "file_link" ("entity_type", "entity_uuid") `)
    await queryRunner.query(`
        CREATE TABLE "file"
        (
            "uuid"                uuid              NOT NULL DEFAULT uuid_generate_v4(),
            "created_at"          TIMESTAMP(3)      NOT NULL DEFAULT now(),
            "updated_at"          TIMESTAMP(3)      NOT NULL DEFAULT now(),
            "deleted_at"          TIMESTAMP(3),
            "name"                character varying NOT NULL,
            "mime_type"           character varying,
            "user_uuid"           uuid,
            "is_upload_confirmed" boolean           NOT NULL DEFAULT false,
            CONSTRAINT "PK_d85c96c207a7395158a68ee1265" PRIMARY KEY ("uuid")
        )`)
    await queryRunner.query(`
        CREATE TABLE "contact"
        (
            "uuid"       uuid         NOT NULL DEFAULT uuid_generate_v4(),
            "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(),
            "is_active"  boolean      NOT NULL DEFAULT true,
            "first_name" character varying,
            "last_name"  character varying,
            "email"      character varying,
            "phone"      character varying,
            CONSTRAINT "PK_126b452db77c24d32b5885f4468" PRIMARY KEY ("uuid")
        )`)
    await queryRunner.query(`
        CREATE TABLE "role"
        (
            "uuid"            uuid                    NOT NULL DEFAULT uuid_generate_v4(),
            "created_at"      TIMESTAMP(3)            NOT NULL DEFAULT now(),
            "updated_at"      TIMESTAMP(3)            NOT NULL DEFAULT now(),
            "name"            character varying       NOT NULL,
            "permissions"     character varying array NOT NULL DEFAULT '{}',
            "is_default"      boolean                 NOT NULL DEFAULT false,
            "is_system_admin" boolean                 NOT NULL DEFAULT false,
            CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE ("name"),
            CONSTRAINT "PK_16fc336b9576146aa1f03fdc7c5" PRIMARY KEY ("uuid")
        )`)
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d3f193e20c60bec11775df7480" ON "role" ("is_default") WHERE is_default`)
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_787e150ba4204750939225fcec" ON "role" ("is_system_admin") WHERE is_system_admin`)
    await queryRunner.query(`
        CREATE TABLE "user"
        (
            "uuid"       uuid              NOT NULL DEFAULT uuid_generate_v4(),
            "user_id"    character varying NOT NULL,
            "created_at" TIMESTAMP(3)      NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP(3)      NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP(3),
            "email"      character varying NOT NULL,
            "first_name" character varying,
            "last_name"  character varying,
            "role_uuid"  uuid,
            CONSTRAINT "UQ_758b8ce7c18b9d347461b30228d" UNIQUE ("user_id"),
            CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
            CONSTRAINT "PK_a95e949168be7b7ece1a2382fed" PRIMARY KEY ("uuid")
        )`)
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `)
    await queryRunner.query(`CREATE INDEX "IDX_8d67721f603379fc854963857b" ON "user" ("role_uuid") `)
    await queryRunner.query(`
        ALTER TABLE "file_link"
        ADD CONSTRAINT "FK_fd4d9563fa6540cd443f3a68558" 
        FOREIGN KEY ("file_uuid") 
        REFERENCES "file" ("uuid") 
        ON DELETE CASCADE 
        ON UPDATE NO ACTION
    `)
    await queryRunner.query(`
        ALTER TABLE "user" 
        ADD CONSTRAINT "FK_8d67721f603379fc854963857b8" 
        FOREIGN KEY ("role_uuid") 
        REFERENCES "role"("uuid") 
        ON DELETE SET NULL 
        ON UPDATE NO ACTION
    `)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_8d67721f603379fc854963857b8"`)
    await queryRunner.query(`ALTER TABLE "file_link" DROP CONSTRAINT "FK_fd4d9563fa6540cd443f3a68558"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_8d67721f603379fc854963857b"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`)
    await queryRunner.query(`DROP TABLE "user"`)
    await queryRunner.query(`DROP TABLE "role"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_10d436bd7d959948e1a78da9a3"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_5bb93473490b5242438d084657"`)
    await queryRunner.query(`DROP TABLE "contact"`)
    await queryRunner.query(`DROP TABLE "file"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_fe44eb53fd9da12f87f1b11697"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_79ce5ff400cb1d853fd6a800d6"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_c75bfa9854abb1f61362722ebb"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_fd4d9563fa6540cd443f3a6855"`)
    await queryRunner.query(`DROP TABLE "file_link"`)
  }
}
