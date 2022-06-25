import {MigrationInterface, QueryRunner} from 'typeorm'

export class CreateShopifyCollectionCache1624458548204 implements MigrationInterface {
  name = 'CreateShopifyCollectionCache1624458548204'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "shopifyCollectionCache" ("id" bigint NOT NULL, "data" jsonb NOT NULL, "productIds" bigint array NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_69c60ffc9fdcfe9f4ba49b709de" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "shopifyCollectionCache"`)
  }
}
