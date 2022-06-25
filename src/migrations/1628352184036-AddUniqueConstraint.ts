import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUniqueConstraint1628352184036 implements MigrationInterface {
  name = 'AddUniqueConstraint1628352184036'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rules" ADD CONSTRAINT "UQ_e93df807d2a1953f83b76b8e412" UNIQUE ("discountCode")`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rules" DROP CONSTRAINT "UQ_e93df807d2a1953f83b76b8e412"`
    )
  }
}
