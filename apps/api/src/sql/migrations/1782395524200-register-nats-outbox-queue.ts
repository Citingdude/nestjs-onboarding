import type { MigrationInterface, QueryRunner } from 'typeorm'

export class RegisterNatsOutboxQueue1782395524200 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SELECT pgboss.create_queue('nats-outbox', '{"policy":"stately"}')`)
    await queryRunner.query(`
      UPDATE pgboss.job
      SET name = 'nats-outbox'
      WHERE name = 'system'
        AND state IN ('created', 'retry')
        AND data->>'className' = 'PublishNatsEventJob'
    `)
  }

  public async down (_queryRunner: QueryRunner): Promise<void> {
  }
}
