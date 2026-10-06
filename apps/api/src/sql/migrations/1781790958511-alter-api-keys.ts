import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AlterApiKeys1781790958511 implements MigrationInterface {
  name = 'AlterApiKeys1781790958511'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api_key" DROP CONSTRAINT "FK_a7c82f9b1d8fc129342dbcbb806"`)
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "created_by_user_uuid"`)
    await queryRunner.query(`ALTER TABLE "api_key" ADD CONSTRAINT "FK_b58b3b25b6353976ed3d5b17074" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api_key" DROP CONSTRAINT "FK_b58b3b25b6353976ed3d5b17074"`)
    await queryRunner.query(`ALTER TABLE "api_key" ADD "created_by_user_uuid" uuid`)
    await queryRunner.query(`ALTER TABLE "api_key" ADD CONSTRAINT "FK_a7c82f9b1d8fc129342dbcbb806" FOREIGN KEY ("created_by_user_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }
}
