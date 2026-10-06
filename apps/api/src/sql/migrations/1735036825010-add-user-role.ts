import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserRole1735036825010 implements MigrationInterface {
  name = 'AddUserRole1735036825010'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_8d67721f603379fc854963857b8"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_8d67721f603379fc854963857b"`)
    await queryRunner.query(`CREATE TABLE "user_role" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_uuid" uuid NOT NULL, "role_uuid" uuid NOT NULL, CONSTRAINT "UQ_b3ae719908a740d300f2032780b" UNIQUE ("user_uuid", "role_uuid"), CONSTRAINT "PK_8d67721f603379fc854963857b8" PRIMARY KEY ("uuid"))`)
    await queryRunner.query(`CREATE INDEX "IDX_3838c6c75fb63afc447bc8fa64" ON "user_role" ("role_uuid") `)
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role_uuid"`)
    await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_2dcc8bd6b8738bc96d9dcf229bd" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_3838c6c75fb63afc447bc8fa64f" FOREIGN KEY ("role_uuid") REFERENCES "role"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_3838c6c75fb63afc447bc8fa64f"`)
    await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_2dcc8bd6b8738bc96d9dcf229bd"`)
    await queryRunner.query(`ALTER TABLE "user" ADD "role_uuid" uuid`)
    await queryRunner.query(`DROP INDEX "public"."IDX_3838c6c75fb63afc447bc8fa64"`)
    await queryRunner.query(`DROP TABLE "user_role"`)
    await queryRunner.query(`CREATE INDEX "IDX_8d67721f603379fc854963857b" ON "user" ("role_uuid") `)
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_8d67721f603379fc854963857b8" FOREIGN KEY ("role_uuid") REFERENCES "role"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`)
  }
}
