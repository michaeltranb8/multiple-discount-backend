import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddHasBundleItemsToRules1623399375188 implements MigrationInterface {
  name = 'AddHasBundleItemsToRules1623399375188'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "rules" ADD "hasBundleItems" boolean NOT NULL DEFAULT true`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "rules" DROP COLUMN "hasBundleItems"`)
  }
}
