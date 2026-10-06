import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddBirthdateToContact1745582872371 implements MigrationInterface {
  name = 'AddBirthdateToContact1745582872371'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contact" ADD "birth_date" date`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "birth_date"`)
  }
}
