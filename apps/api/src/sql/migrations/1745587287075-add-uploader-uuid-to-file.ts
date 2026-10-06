import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUploaderUuidToFile1745587287075 implements MigrationInterface {
  name = 'AddUploaderUuidToFile1745587287075'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" ADD "uploader_uuid" uuid`)
    await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_642717b36b5f1695da2e31d9043" FOREIGN KEY ("uploader_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_642717b36b5f1695da2e31d9043"`)
    await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "uploader_uuid"`)
  }
}
