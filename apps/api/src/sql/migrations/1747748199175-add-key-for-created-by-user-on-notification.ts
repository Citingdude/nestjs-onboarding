import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddKeyForCreatedByUserOnNotification1747748199175 implements MigrationInterface {
  name = 'AddKeyForCreatedByUserOnNotification1747748199175'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_c89a7082a16e26c66a36cc8e120" FOREIGN KEY ("created_by_user_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_c89a7082a16e26c66a36cc8e120"`)
  }
}
