import type { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTodoTable1791380180380 implements MigrationInterface {
  name = 'CreateTodoTable1791380180380'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "todo" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" text NOT NULL, "description" text, "deadline" TIMESTAMP, "completed" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "user_uuid" uuid NOT NULL, CONSTRAINT "PK_17b57427465caa8ca57e2741db2" PRIMARY KEY ("uuid"))`)
    await queryRunner.query(`CREATE INDEX "IDX_0f06ae6e6255d6381c8eaa248a" ON "todo"  ("user_uuid") `)
    await queryRunner.query(`ALTER TABLE "todo" ADD CONSTRAINT "FK_0f06ae6e6255d6381c8eaa248aa" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "todo" DROP CONSTRAINT "FK_0f06ae6e6255d6381c8eaa248aa"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_0f06ae6e6255d6381c8eaa248a"`)
    await queryRunner.query(`DROP TABLE "todo"`)
  }
}
