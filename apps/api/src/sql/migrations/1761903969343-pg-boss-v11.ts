import type { MigrationInterface, QueryRunner } from 'typeorm'
import { getConstructionPlans } from '@wisemen/pgboss-nestjs-job'

export class PgBossV111761903969343 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$
            BEGIN
              IF EXISTS (
                SELECT 1
                FROM information_schema.schemata
                WHERE schema_name = 'pgboss'
              ) THEN
                EXECUTE 'ALTER SCHEMA pgboss RENAME TO pgboss_v10';
              END IF;
            END $$;
          `)

    const migrations = getConstructionPlans()

    await queryRunner.query(migrations)
    await queryRunner.query(`SELECT pgboss.create_queue('system', '{"policy":"stately"}')`)
  }

  public async down (_queryRunner: QueryRunner): Promise<void> {
  }
}
