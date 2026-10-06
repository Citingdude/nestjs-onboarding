import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddExportEntity1778510487847 implements MigrationInterface {
  name = 'AddExportEntity1778510487847'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."export_status" AS ENUM('created', 'succeeded', 'failed')`)
    await queryRunner.query(`CREATE TYPE "public"."export_type" AS ENUM('contact_csv')`)
    await queryRunner.query(`CREATE TABLE "export" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "status" "public"."export_status" NOT NULL DEFAULT 'created', "type" "public"."export_type" NOT NULL, "file_uuid" uuid, "requested_by_user_uuid" uuid NOT NULL, "error_message" character varying, CONSTRAINT "PK_8e94ffabcf2c21c77fdf581d0ee" PRIMARY KEY ("uuid"))`)
    await queryRunner.query(`ALTER TABLE "export" ADD CONSTRAINT "FK_3a9420b4dd4bd88a3d273b90019" FOREIGN KEY ("file_uuid") REFERENCES "file"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "export" ADD CONSTRAINT "FK_d8702e2a0204c20b1e9ca71954d" FOREIGN KEY ("requested_by_user_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "export" DROP CONSTRAINT "FK_d8702e2a0204c20b1e9ca71954d"`)
    await queryRunner.query(`ALTER TABLE "export" DROP CONSTRAINT "FK_3a9420b4dd4bd88a3d273b90019"`)
    await queryRunner.query(`DROP TABLE "export"`)
    await queryRunner.query(`DROP TYPE "public"."export_type"`)
    await queryRunner.query(`DROP TYPE "public"."export_status"`)
  }
}
