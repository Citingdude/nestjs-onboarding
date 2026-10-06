import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUiPreferencesTable1743423982315 implements MigrationInterface {
  name = 'AddUiPreferencesTable1743423982315'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."ui_preferences_theme_enum" AS ENUM('light', 'dark', 'system')`)
    await queryRunner.query(`CREATE TYPE "public"."ui_preferences_font_size_enum" AS ENUM('smaller', 'small', 'default', 'large', 'larger')`)
    await queryRunner.query(`
        CREATE TABLE "ui_preferences" (
            "user_uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            "theme" "public"."ui_preferences_theme_enum" NOT NULL DEFAULT 'system', 
            "language" character varying NOT NULL, 
            "font_size" "public"."ui_preferences_font_size_enum" NOT NULL DEFAULT 'default', 
            "show_shortcuts" boolean NOT NULL DEFAULT false, 
            "reduce_motion" boolean NOT NULL DEFAULT false, 
            "high_contrast" boolean NOT NULL DEFAULT false, 
            CONSTRAINT "PK_060c5ab7ca411377e5e866c7133" PRIMARY KEY ("user_uuid")
    )`)
    await queryRunner.query(`
      ALTER TABLE "ui_preferences" 
      ADD CONSTRAINT "FK_060c5ab7ca411377e5e866c7133" 
      FOREIGN KEY ("user_uuid") 
      REFERENCES "user"("uuid") 
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION
    `)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ui_preferences" DROP CONSTRAINT "FK_060c5ab7ca411377e5e866c7133"`)
    await queryRunner.query(`DROP TABLE "ui_preferences"`)
    await queryRunner.query(`DROP TYPE "public"."ui_preferences_font_size_enum"`)
    await queryRunner.query(`DROP TYPE "public"."ui_preferences_theme_enum"`)
  }
}
