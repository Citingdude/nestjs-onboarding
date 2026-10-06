import type { MigrationInterface, QueryRunner } from 'typeorm'

export class ReuseNotificationTypeEnum1745584544034 implements MigrationInterface {
  name = 'ReuseNotificationTypeEnum1745584544034'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."notification_type_enum" RENAME TO "notification_type_enum_old"`)
    await queryRunner.query(`CREATE TYPE "public"."notification-type" AS ENUM('user.created', 'test-notification')`)
    await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "type" TYPE "public"."notification-type" USING "type"::"text"::"public"."notification-type"`)
    await queryRunner.query(`DROP TYPE "public"."notification_type_enum_old"`)
    await queryRunner.query(`ALTER TYPE "public"."notification_migration_type_enum" RENAME TO "notification_migration_type_enum_old"`)
    await queryRunner.query(`ALTER TABLE "notification_migration" ALTER COLUMN "type" TYPE "public"."notification-type" USING "type"::"text"::"public"."notification-type"`)
    await queryRunner.query(`DROP TYPE "public"."notification_migration_type_enum_old"`)
    await queryRunner.query(`ALTER TYPE "public"."notification_preferences_types_enum" RENAME TO "notification_preferences_types_enum_old"`)
    await queryRunner.query(`ALTER TABLE "notification_preferences" ALTER COLUMN "types" TYPE "public"."notification-type"[] USING "types"::"text"::"public"."notification-type"[]`)
    await queryRunner.query(`DROP TYPE "public"."notification_preferences_types_enum_old"`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."notification_preferences_types_enum_old" AS ENUM('user.created')`)
    await queryRunner.query(`ALTER TABLE "notification_preferences" ALTER COLUMN "types" TYPE "public"."notification_preferences_types_enum_old"[] USING "types"::"text"::"public"."notification_preferences_types_enum_old"[]`)
    await queryRunner.query(`DROP TYPE "public"."notification-type"`)
    await queryRunner.query(`ALTER TYPE "public"."notification_preferences_types_enum_old" RENAME TO "notification_preferences_types_enum"`)
    await queryRunner.query(`CREATE TYPE "public"."notification_migration_type_enum_old" AS ENUM('user.created')`)
    await queryRunner.query(`ALTER TABLE "notification_migration" ALTER COLUMN "type" TYPE "public"."notification_migration_type_enum_old" USING "type"::"text"::"public"."notification_migration_type_enum_old"`)
    await queryRunner.query(`DROP TYPE "public"."notification-type"`)
    await queryRunner.query(`ALTER TYPE "public"."notification_migration_type_enum_old" RENAME TO "notification_migration_type_enum"`)
    await queryRunner.query(`CREATE TYPE "public"."notification_type_enum_old" AS ENUM('user.created')`)
    await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "type" TYPE "public"."notification_type_enum_old" USING "type"::"text"::"public"."notification_type_enum_old"`)
    await queryRunner.query(`DROP TYPE "public"."notification-type"`)
    await queryRunner.query(`ALTER TYPE "public"."notification_type_enum_old" RENAME TO "notification_type_enum"`)
  }
}
