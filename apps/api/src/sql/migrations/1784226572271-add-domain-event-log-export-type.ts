import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddDomainEventLogExportType1784226572271 implements MigrationInterface {
  name = 'AddDomainEventLogExportType1784226572271'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."export_type" ADD VALUE 'domain_event_log_csv'`
    )
  }

  public async down (_queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL enum values cannot be removed safely without recreating the type.
  }
}
