import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddDeletedAtOnContactTable1744374615855 implements MigrationInterface {
  name = 'AddDeletedAtOnContactTable1744374615855'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contact" ADD "deleted_at" TIMESTAMP(3)`)
    await queryRunner.query(`CREATE INDEX "IDX_1611bff648370477d5d0a6156c" ON "contact" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_625e148bbe3879ba6b7352d458" ON "contact" ("deleted_at") `)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_625e148bbe3879ba6b7352d458"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_1611bff648370477d5d0a6156c"`)
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "deleted_at"`)
  }
}
