import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAvatarToContact1745429739412 implements MigrationInterface {
  name = 'AddAvatarToContact1745429739412'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contact" ADD "avatar_uuid" uuid`)
    await queryRunner.query(`ALTER TABLE "contact" ADD CONSTRAINT "FK_495b15e15b4d43f1899d1e66cf7" FOREIGN KEY ("file_uuid") REFERENCES "file"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "contact" ADD CONSTRAINT "FK_e31c945a6e64e6553ac820ed920" FOREIGN KEY ("avatar_uuid") REFERENCES "file"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contact" DROP CONSTRAINT "FK_e31c945a6e64e6553ac820ed920"`)
    await queryRunner.query(`ALTER TABLE "contact" DROP CONSTRAINT "FK_495b15e15b4d43f1899d1e66cf7"`)
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "avatar_uuid"`)
  }
}
