import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm'

export class DropShopifyItemCache1623313262580 implements MigrationInterface {
  table = new Table({
    name: 'shopifyItemCache',
    columns: [
      { name: 'id', type: 'int', isPrimary: true, isGenerated: true },
      { name: 'shopifyType', type: 'varchar' },
      { name: 'shopifyId', type: 'bigint' },
      { name: 'data', type: 'jsonb' },
      { name: 'createdAt', type: 'timestamp', default: 'NOW()' },
      { name: 'updatedAt', type: 'timestamp', default: 'NOW()' }
    ]
  })

  index = new TableIndex({
    name: 'index_on_shopifyItemCache_shopifyType_shopifyId',
    columnNames: ['shopifyType', 'shopifyId']
  })

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(this.table, this.index)
    await queryRunner.dropTable(this.table)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table)
    await queryRunner.createIndex(this.table, this.index)
  }
}
