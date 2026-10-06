import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddNotificationTables1744200524665 implements MigrationInterface {
  name = 'AddNotificationTables1744200524665'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('user.created')`)
    await queryRunner.query(`CREATE TABLE "notification" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by_user_uuid" uuid, "type" "public"."notification_type_enum" NOT NULL, "meta" jsonb NOT NULL, CONSTRAINT "PK_b9fa421f94f7707ba109bf73b82" PRIMARY KEY ("uuid"))`)
    await queryRunner.query(`CREATE TYPE "public"."notification_migration_type_enum" AS ENUM('user.created')`)
    await queryRunner.query(`CREATE TABLE "notification_migration" ("type" "public"."notification_migration_type_enum" NOT NULL, "migrated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_2b371d43ae8b66d3ccf3cf9d1c3" PRIMARY KEY ("type"))`)
    await queryRunner.query(`CREATE TYPE "public"."user_notification_channel_enum" AS ENUM('email', 'sms', 'app', 'push')`)
    await queryRunner.query(`CREATE TABLE "user_notification" ("user_uuid" uuid NOT NULL, "notification_uuid" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "read_at" TIMESTAMP WITH TIME ZONE, "channel" "public"."user_notification_channel_enum" NOT NULL, CONSTRAINT "PK_a3e698be4f4acc2001d3e4777fb" PRIMARY KEY ("user_uuid", "notification_uuid"))`)
    await queryRunner.query(`CREATE INDEX "IDX_7274f65f9701c79bdcdd690370" ON "user_notification" ("notification_uuid", "channel") `)
    await queryRunner.query(`CREATE TYPE "public"."notification_preferences_types_enum" AS ENUM('user.created')`)
    await queryRunner.query(`CREATE TYPE "public"."notification_preferences_channel_enum" AS ENUM('email', 'sms', 'app', 'push')`)
    await queryRunner.query(`CREATE TABLE "notification_preferences" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_uuid" uuid NOT NULL, "types" "public"."notification_preferences_types_enum" array NOT NULL, "channel" "public"."notification_preferences_channel_enum" NOT NULL, "is_enabled" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_notification_preferences_user_channel" UNIQUE ("user_uuid", "channel"), CONSTRAINT "PK_dddb59a3d64503afd7783c9c6c8" PRIMARY KEY ("uuid"))`)
    await queryRunner.query(`CREATE INDEX "IDX_688ca4c48734ea07b99c773f98" ON "notification_preferences" ("channel", "is_enabled") `)
    await queryRunner.query(`CREATE TYPE "public"."notification_preferences_preset_preset_enum" AS ENUM('all', 'default', 'custom', 'none')`)
    await queryRunner.query(`CREATE TABLE "notification_preferences_preset" ("user_uuid" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "preset" "public"."notification_preferences_preset_preset_enum" NOT NULL, CONSTRAINT "PK_784d13c2304ff1dcda479d20db5" PRIMARY KEY ("user_uuid"))`)
    await queryRunner.query(`ALTER TABLE "user_notification" ADD CONSTRAINT "FK_a46759e01bc8732388b93c8d157" FOREIGN KEY ("notification_uuid") REFERENCES "notification"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "notification_preferences" ADD CONSTRAINT "FK_1d1b746494887df2a56b376f9fe" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "notification_preferences_preset" ADD CONSTRAINT "FK_784d13c2304ff1dcda479d20db5" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await queryRunner.query(`CREATE INDEX "IDX_12b3ad2ae2dd07f07b9d1ce5a2" ON "notification_preferences_preset" ("preset") `)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notification_preferences_preset" DROP CONSTRAINT "FK_784d13c2304ff1dcda479d20db5"`)
    await queryRunner.query(`ALTER TABLE "notification_preferences" DROP CONSTRAINT "FK_1d1b746494887df2a56b376f9fe"`)
    await queryRunner.query(`ALTER TABLE "user_notification" DROP CONSTRAINT "FK_a46759e01bc8732388b93c8d157"`)
    await queryRunner.query(`DROP TABLE "notification_preferences_preset"`)
    await queryRunner.query(`DROP TYPE "public"."notification_preferences_preset_preset_enum"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_688ca4c48734ea07b99c773f98"`)
    await queryRunner.query(`DROP TABLE "notification_preferences"`)
    await queryRunner.query(`DROP TYPE "public"."notification_preferences_channel_enum"`)
    await queryRunner.query(`DROP TYPE "public"."notification_preferences_types_enum"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_7274f65f9701c79bdcdd690370"`)
    await queryRunner.query(`DROP TABLE "user_notification"`)
    await queryRunner.query(`DROP TYPE "public"."user_notification_channel_enum"`)
    await queryRunner.query(`DROP TABLE "notification_migration"`)
    await queryRunner.query(`DROP TYPE "public"."notification_migration_type_enum"`)
    await queryRunner.query(`DROP TABLE "notification"`)
    await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`)
  }
}
