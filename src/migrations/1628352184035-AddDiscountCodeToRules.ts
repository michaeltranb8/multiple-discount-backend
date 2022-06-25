import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddDiscountCodeToRules1628352184035 implements MigrationInterface {
  name = 'AddDiscountCodeToRules1628352184035'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rules" ADD "hasDiscountCode" boolean NOT NULL DEFAULT false`
    )
    await queryRunner.query(
      `ALTER TABLE "rules" ADD "discountCode" character varying`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "rules" DROP COLUMN "discountCode"`)
    await queryRunner.query(`ALTER TABLE "rules" DROP COLUMN "hasDiscountCode"`)
  }
}
