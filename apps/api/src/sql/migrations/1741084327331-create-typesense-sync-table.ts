import type { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTypesenseSyncTable1741084327331 implements MigrationInterface {
  name = 'CreateTypesenseSyncTable1741084327331'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "typesense_sync"
        (
            "collection"     character varying        NOT NULL,
            "last_synced_at" TIMESTAMP WITH TIME ZONE NOT NULL,
            CONSTRAINT "PK_ccfda5ddaf6ae6999ed536df812" PRIMARY KEY ("collection")
        )`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "typesense_sync"`)
  }
}
