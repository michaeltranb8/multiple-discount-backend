import { MigrationInterface, QueryRunner } from 'typeorm'

export class TypeORMAutoGeneration1623387929187 implements MigrationInterface {
  name = 'TypeORMAutoGeneration1623387929187'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "rules" DROP CONSTRAINT "rules_storeId"`)
    await queryRunner.query(`ALTER TABLE "configurations" DROP CONSTRAINT "configurations_storeId"`)
    await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "storefrontAccessToken"`)
    await queryRunner.query(`ALTER TABLE "configurations" DROP COLUMN "themeAdapter"`)
    await queryRunner.query(`ALTER TABLE "rules" ALTER COLUMN "storeId" DROP NOT NULL`)
    await queryRunner.query(`COMMENT ON COLUMN "rules"."storeId" IS NULL`)
    await queryRunner.query(`ALTER TABLE "configurations" ALTER COLUMN "storeId" DROP NOT NULL`)
    await queryRunner.query(`COMMENT ON COLUMN "configurations"."storeId" IS NULL`)
    await queryRunner.query(`ALTER TABLE "rules" ADD CONSTRAINT "FK_3a9170269408147aee203216b37" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "configurations" ADD CONSTRAINT "FK_bbd4b19a9c4df96e77c986f8db4" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "configurations" DROP CONSTRAINT "FK_bbd4b19a9c4df96e77c986f8db4"`)
    await queryRunner.query(`ALTER TABLE "rules" DROP CONSTRAINT "FK_3a9170269408147aee203216b37"`)
    await queryRunner.query(`COMMENT ON COLUMN "configurations"."storeId" IS NULL`)
    await queryRunner.query(`ALTER TABLE "configurations" ALTER COLUMN "storeId" SET NOT NULL`)
    await queryRunner.query(`COMMENT ON COLUMN "rules"."storeId" IS NULL`)
    await queryRunner.query(`ALTER TABLE "rules" ALTER COLUMN "storeId" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "configurations" ADD "themeAdapter" character varying NOT NULL DEFAULT ''`)
    await queryRunner.query(`ALTER TABLE "stores" ADD "storefrontAccessToken" character varying`)
    await queryRunner.query(`ALTER TABLE "configurations" ADD CONSTRAINT "configurations_storeId" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "rules" ADD CONSTRAINT "rules_storeId" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
  }
}
