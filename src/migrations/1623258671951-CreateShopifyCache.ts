import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateShopifyCache1623258671951 implements MigrationInterface {
  name = 'CreateShopifyCache1623258671951'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "shopifyVariantCache" ("id" bigint NOT NULL, "productId" bigint NOT NULL, "data" jsonb NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_55f92fa7e44ceec06e652d50143" PRIMARY KEY ("id"))`)
    await queryRunner.query(`CREATE TABLE "shopifyProductCache" ("id" bigint NOT NULL, "data" jsonb NOT NULL, "variantIds" bigint array NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_01a037680d0e66ed19c95d76377" PRIMARY KEY ("id"))`)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "shopifyProductCache"`)
    await queryRunner.query(`DROP TABLE "shopifyVariantCache"`)
  }
}
