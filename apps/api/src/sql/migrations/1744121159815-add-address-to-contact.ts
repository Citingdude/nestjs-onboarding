import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAddressToContact1744121159815 implements MigrationInterface {
  name = 'AddAddressToContact1744121159815'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contact" ADD "address_country" character varying`)
    await queryRunner.query(`ALTER TABLE "contact" ADD "address_city" character varying`)
    await queryRunner.query(`ALTER TABLE "contact" ADD "address_postal_code" character varying`)
    await queryRunner.query(`ALTER TABLE "contact" ADD "address_street_name" character varying`)
    await queryRunner.query(`ALTER TABLE "contact" ADD "address_street_number" character varying`)
    await queryRunner.query(`ALTER TABLE "contact" ADD "address_unit" character varying`)
    await queryRunner.query(`ALTER TABLE "contact" ADD "address_coordinates" geometry(Point,4326)`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "address_coordinates"`)
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "address_unit"`)
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "address_street_number"`)
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "address_street_name"`)
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "address_postal_code"`)
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "address_city"`)
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "address_country"`)
  }
}
