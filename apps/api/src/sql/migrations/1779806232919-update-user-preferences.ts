import type { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateUserPreferences1779806232919 implements MigrationInterface {
  name = 'UpdateUserPreferences1779806232919'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ui_preferences" RENAME TO "user_preferences"`)

    await queryRunner.query(`CREATE TYPE "public"."ui_theme" AS ENUM('light', 'dark', 'system')`)
    await queryRunner.query(`CREATE TYPE "public"."display_zoom" AS ENUM('small', 'default', 'large')`)
    await queryRunner.query(`CREATE TYPE "public"."auto_close_notifications" AS ENUM('always', 'all-except-errors', 'never')`)
    await queryRunner.query(`CREATE TYPE "public"."number_format" AS ENUM('comma-period', 'period-comma', 'space-comma', 'space-period', 'system')`)
    await queryRunner.query(`CREATE TYPE "public"."hour_cycle" AS ENUM('12-hour', '24-hour', 'device-default')`)

    // Migrate theme column to appearance with new enum
    await queryRunner.query(`ALTER TABLE "user_preferences" ALTER COLUMN "theme" DROP DEFAULT`)
    await queryRunner.query(`ALTER TABLE "user_preferences" ALTER COLUMN "theme" TYPE "public"."ui_theme" USING "theme"::"text"::"public"."ui_theme"`)
    await queryRunner.query(`ALTER TABLE "user_preferences" ALTER COLUMN "theme" SET DEFAULT 'system'`)
    await queryRunner.query(`ALTER TABLE "user_preferences" RENAME COLUMN "theme" TO "appearance"`)

    // Migrate font_size column to display_zoom with new enum and value mapping
    await queryRunner.query(`ALTER TABLE "user_preferences" ALTER COLUMN "font_size" DROP DEFAULT`)
    await queryRunner.query(`
      ALTER TABLE "user_preferences" 
      ALTER COLUMN "font_size" TYPE "public"."display_zoom" 
      USING (
        CASE 
          WHEN "font_size"::"text" = 'smaller' THEN 'small'
          WHEN "font_size"::"text" = 'larger' THEN 'large'
          ELSE "font_size"::"text"
        END
      )::"public"."display_zoom"
    `)
    await queryRunner.query(`ALTER TABLE "user_preferences" ALTER COLUMN "font_size" SET DEFAULT 'default'`)
    await queryRunner.query(`ALTER TABLE "user_preferences" RENAME COLUMN "font_size" TO "display_zoom"`)

    await queryRunner.query(`DROP TYPE "public"."ui_preferences_theme_enum"`)
    await queryRunner.query(`DROP TYPE "public"."ui_preferences_font_size_enum"`)

    await queryRunner.query(`ALTER TABLE "user_preferences" RENAME COLUMN "reduce_motion" TO "reduced_motion"`)

    await queryRunner.query(`ALTER TABLE "user_preferences" ADD "show_navigation_arrows" boolean NOT NULL DEFAULT false`)
    await queryRunner.query(`ALTER TABLE "user_preferences" ADD "auto_close_notifications" "public"."auto_close_notifications" NOT NULL DEFAULT 'all-except-errors'`)
    await queryRunner.query(`ALTER TABLE "user_preferences" ADD "number_format" "public"."number_format" NOT NULL DEFAULT 'system'`)
    await queryRunner.query(`ALTER TABLE "user_preferences" ADD "hour_cycle" "public"."hour_cycle" NOT NULL DEFAULT 'device-default'`)
    await queryRunner.query(`ALTER TABLE "user_preferences" ADD "time_zone" character varying`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_preferences" DROP COLUMN "time_zone"`)
    await queryRunner.query(`ALTER TABLE "user_preferences" DROP COLUMN "hour_cycle"`)
    await queryRunner.query(`ALTER TABLE "user_preferences" DROP COLUMN "number_format"`)
    await queryRunner.query(`ALTER TABLE "user_preferences" DROP COLUMN "auto_close_notifications"`)
    await queryRunner.query(`ALTER TABLE "user_preferences" DROP COLUMN "show_navigation_arrows"`)

    await queryRunner.query(`CREATE TYPE "public"."ui_preferences_theme_enum" AS ENUM('light', 'dark', 'system')`)
    await queryRunner.query(`CREATE TYPE "public"."ui_preferences_font_size_enum" AS ENUM('smaller', 'small', 'default', 'large', 'larger')`)

    await queryRunner.query(`ALTER TABLE "user_preferences" RENAME COLUMN "reduced_motion" TO "reduce_motion"`)

    await queryRunner.query(`ALTER TABLE "user_preferences" RENAME COLUMN "display_zoom" TO "font_size"`)
    await queryRunner.query(`ALTER TABLE "user_preferences" ALTER COLUMN "font_size" DROP DEFAULT`)
    await queryRunner.query(`ALTER TABLE "user_preferences" ALTER COLUMN "font_size" TYPE "public"."ui_preferences_font_size_enum" USING "font_size"::"text"::"public"."ui_preferences_font_size_enum"`)
    await queryRunner.query(`ALTER TABLE "user_preferences" ALTER COLUMN "font_size" SET DEFAULT 'default'`)

    await queryRunner.query(`ALTER TABLE "user_preferences" RENAME COLUMN "appearance" TO "theme"`)
    await queryRunner.query(`ALTER TABLE "user_preferences" ALTER COLUMN "theme" DROP DEFAULT`)
    await queryRunner.query(`ALTER TABLE "user_preferences" ALTER COLUMN "theme" TYPE "public"."ui_preferences_theme_enum" USING "theme"::"text"::"public"."ui_preferences_theme_enum"`)
    await queryRunner.query(`ALTER TABLE "user_preferences" ALTER COLUMN "theme" SET DEFAULT 'system'`)

    await queryRunner.query(`DROP TYPE "public"."hour_cycle"`)
    await queryRunner.query(`DROP TYPE "public"."number_format"`)
    await queryRunner.query(`DROP TYPE "public"."auto_close_notifications"`)
    await queryRunner.query(`DROP TYPE "public"."display_zoom"`)
    await queryRunner.query(`DROP TYPE "public"."ui_theme"`)

    await queryRunner.query(`ALTER TABLE "user_preferences" RENAME TO "ui_preferences"`)
  }
}
