import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeDiscountUsageColumn1629859269837 implements MigrationInterface {
    name = 'ChangeDiscountUsageColumn1629859269837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SEQUENCE "discount_usages_id_seq" OWNED BY "discountUsages"."id"`);
        await queryRunner.query(`ALTER TABLE "discountUsages" ALTER COLUMN "id" SET DEFAULT nextval('discount_usages_id_seq')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "discountUsages" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "discount_usages_id_seq"`);
    }

}
