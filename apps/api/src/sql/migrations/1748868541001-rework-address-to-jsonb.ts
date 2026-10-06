import type { MigrationInterface, QueryRunner } from 'typeorm'

export class ReworkAddressToJsonb1748868541001 implements MigrationInterface {
  name = 'ReworkAddressToJsonb1748868541001'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "balance_amount"`)
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "balance_currency"`)
    await queryRunner.query(`DROP TYPE "public"."currency"`)
    await queryRunner.query(`ALTER TABLE "contact" ADD "balance" jsonb`)

    // Add address columns to JSONB
    await queryRunner.query(`ALTER TABLE "contact" ADD "address" jsonb`)

    // Migrate existing data to the new JSONB column
    await queryRunner.query(`
      UPDATE "contact"
      SET "address" = jsonb_build_object(
        'country', COALESCE("address_country", ''),
        'city', COALESCE("address_city", ''),
        'postalCode', COALESCE("address_postal_code", ''),
        'streetName', COALESCE("address_street_name", ''),
        'streetNumber', COALESCE("address_street_number", ''),
        'unit', COALESCE("address_unit", ''),
        'coordinates', CASE
          WHEN "address_coordinates" IS NOT NULL
          THEN jsonb_build_object(
            'latitude', ST_Y("address_coordinates"),
            'longitude', ST_X("address_coordinates")
          )
          ELSE NULL
        END
      )
      WHERE "address" IS NULL
    `)

    // Remove old address columns
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "address_country"`)
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "address_city"`)
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "address_postal_code"`)
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "address_street_name"`)
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "address_street_number"`)
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "address_unit"`)
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "address_coordinates"`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    // Recreate old address columns
    await queryRunner.query(`ALTER TABLE "contact" ADD "address_country" character varying`)
    await queryRunner.query(`ALTER TABLE "contact" ADD "address_city" character varying`)
    await queryRunner.query(`ALTER TABLE "contact" ADD "address_postal_code" character varying`)
    await queryRunner.query(`ALTER TABLE "contact" ADD "address_street_name" character varying`)
    await queryRunner.query(`ALTER TABLE "contact" ADD "address_street_number" character varying`)
    await queryRunner.query(`ALTER TABLE "contact" ADD "address_unit" character varying`)
    await queryRunner.query(`ALTER TABLE "contact" ADD "address_coordinates" geometry(Point,4326)`)

    // Migrate data back from JSONB to individual columns
    await queryRunner.query(`
      UPDATE "contact"
      SET
        "address_country" = NULLIF("address"->>'country', ''),
        "address_city" = NULLIF("address"->>'city', ''),
        "address_postal_code" = NULLIF("address"->>'postalCode', ''),
        "address_street_name" = NULLIF("address"->>'streetName', ''),
        "address_street_number" = NULLIF("address"->>'streetNumber', ''),
        "address_unit" = NULLIF("address"->>'unit', ''),
        "address_coordinates" = CASE
          WHEN "address"->'coordinates' IS NOT NULL
          THEN ST_SetSRID(ST_MakePoint(
            ("address"->'coordinates'->>'longitude')::float,
            ("address"->'coordinates'->>'latitude')::float
          ), 4326)
          ELSE NULL
        END
      WHERE "address" IS NOT NULL
    `)

    // Drop the JSONB address column
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "address"`)

    await queryRunner.query(`CREATE TYPE "public"."currency" AS ENUM('AFN', 'EUR', 'ALL', 'DZD', 'USD', 'AOA', 'XCD', 'ARS', 'AMD', 'AWG', 'AUD', 'AZN', 'BSD', 'BHD', 'BDT', 'BBD', 'BYN', 'BZD', 'XOF', 'BMD', 'INR', 'BTN', 'BOB', 'BOV', 'BAM', 'BWP', 'NOK', 'BRL', 'BND', 'BGN', 'BIF', 'CVE', 'KHR', 'XAF', 'CAD', 'KYD', 'CLP', 'CLF', 'CNY', 'COP', 'COU', 'KMF', 'CDF', 'NZD', 'CRC', 'CUP', 'ANG', 'CZK', 'DKK', 'DJF', 'DOP', 'EGP', 'SVC', 'ERN', 'SZL', 'ETB', 'FKP', 'FJD', 'XPF', 'GMD', 'GEL', 'GHS', 'GIP', 'GTQ', 'GBP', 'GNF', 'GYD', 'HTG', 'HNL', 'HKD', 'HUF', 'ISK', 'IDR', 'XDR', 'IRR', 'IQD', 'ILS', 'JMD', 'JPY', 'JOD', 'KZT', 'KES', 'KPW', 'KRW', 'KWD', 'KGS', 'LAK', 'LBP', 'LSL', 'ZAR', 'LRD', 'LYD', 'CHF', 'MOP', 'MKD', 'MGA', 'MWK', 'MYR', 'MVR', 'MRU', 'MUR', 'XUA', 'MXN', 'MXV', 'MDL', 'MNT', 'MAD', 'MZN', 'MMK', 'NAD', 'NPR', 'NIO', 'NGN', 'OMR', 'PKR', 'PAB', 'PGK', 'PYG', 'PEN', 'PHP', 'PLN', 'QAR', 'RON', 'RUB', 'RWF', 'SHP', 'WST', 'STN', 'SAR', 'RSD', 'SCR', 'SLE', 'SGD', 'XSU', 'SBD', 'SOS', 'SSP', 'LKR', 'SDG', 'SRD', 'SEK', 'CHE', 'CHW', 'SYP', 'TWD', 'TJS', 'TZS', 'THB', 'TOP', 'TTD', 'TND', 'TRY', 'TMT', 'UGX', 'UAH', 'AED', 'USN', 'UYU', 'UYI', 'UYW', 'UZS', 'VUV', 'VES', 'VED', 'VND', 'YER', 'ZMW', 'ZWG', 'XBA', 'XBB', 'XBC', 'XBD', 'XTS', 'XXX', 'XAU', 'XPD', 'XPT', 'XAG')`)
    await queryRunner.query(`ALTER TABLE "contact" ADD "balance_currency" "public"."currency"`)
    await queryRunner.query(`ALTER TABLE "contact" ADD "balance_amount" integer`)
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "balance"`)
  }
}
