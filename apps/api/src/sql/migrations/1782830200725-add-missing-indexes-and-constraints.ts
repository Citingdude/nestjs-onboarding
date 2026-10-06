import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMissingIndexesAndConstraints1782830200725 implements MigrationInterface {
  name = 'AddMissingIndexesAndConstraints1782830200725'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_preferences" DROP CONSTRAINT "FK_060c5ab7ca411377e5e866c7133"`)
    await queryRunner.query(`ALTER TABLE "export" DROP CONSTRAINT "FK_3a9420b4dd4bd88a3d273b90019"`)
    await queryRunner.query(`ALTER TABLE "export" DROP CONSTRAINT "FK_d8702e2a0204c20b1e9ca71954d"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_486882550e8b66e56bf24fed86"`)
    await queryRunner.query(`ALTER TABLE "feature_flag" DROP CONSTRAINT "UQ_609e425cccb0f775e63c4a2b3b1"`)
    await queryRunner.query(`ALTER TABLE "feature_flag" ADD CONSTRAINT "UQ_486882550e8b66e56bf24fed86d" UNIQUE ("flag_name")`)
    await queryRunner.query(`ALTER TABLE "feature_flag" ADD CONSTRAINT "UQ_609e425cccb0f775e63c4a2b3b1" UNIQUE ("flag_name", "flagset")`)
    await queryRunner.query(`ALTER TABLE "user_preferences" ADD CONSTRAINT "FK_53ffbf9801979810db40f5d130a" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "export" ADD CONSTRAINT "FK_063b5a24c6c5d28774e8b24b6d2" FOREIGN KEY ("file_uuid") REFERENCES "file"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "export" ADD CONSTRAINT "FK_8528e6543dfaa800b4a90e2d884" FOREIGN KEY ("requested_by_user_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "export" DROP CONSTRAINT "FK_8528e6543dfaa800b4a90e2d884"`)
    await queryRunner.query(`ALTER TABLE "export" DROP CONSTRAINT "FK_063b5a24c6c5d28774e8b24b6d2"`)
    await queryRunner.query(`ALTER TABLE "user_preferences" DROP CONSTRAINT "FK_53ffbf9801979810db40f5d130a"`)
    await queryRunner.query(`ALTER TABLE "feature_flag" DROP CONSTRAINT "UQ_609e425cccb0f775e63c4a2b3b1"`)
    await queryRunner.query(`ALTER TABLE "feature_flag" DROP CONSTRAINT "UQ_486882550e8b66e56bf24fed86d"`)
    await queryRunner.query(`ALTER TABLE "feature_flag" ADD CONSTRAINT "UQ_609e425cccb0f775e63c4a2b3b1" UNIQUE ("flag_name", "flagset")`)
    await queryRunner.query(`CREATE INDEX "IDX_486882550e8b66e56bf24fed86" ON "feature_flag" ("flag_name") `)
    await queryRunner.query(`ALTER TABLE "export" ADD CONSTRAINT "FK_d8702e2a0204c20b1e9ca71954d" FOREIGN KEY ("requested_by_user_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "export" ADD CONSTRAINT "FK_3a9420b4dd4bd88a3d273b90019" FOREIGN KEY ("file_uuid") REFERENCES "file"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "user_preferences" ADD CONSTRAINT "FK_060c5ab7ca411377e5e866c7133" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }
}
