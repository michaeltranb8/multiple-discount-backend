import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateDiscountUsages1627026293600 implements MigrationInterface {
  name = 'CreateDiscountUsages1627026293600'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "discountUsages" ("id" bigint NOT NULL, "customerId" bigint NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ruleId" integer, CONSTRAINT "PK_ee020583f2d78fd5c99a9ddd5c4" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "discountUsages" ADD CONSTRAINT "FK_581c04d025071164d970f588562" FOREIGN KEY ("ruleId") REFERENCES "rules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "discountUsages" DROP CONSTRAINT "FK_581c04d025071164d970f588562"`
    )
    await queryRunner.query(`DROP TABLE "discountUsages"`)
  }
}
