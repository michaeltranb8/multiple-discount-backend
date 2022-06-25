import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateStores1613743814276 implements MigrationInterface {
  table = new Table({
    name: 'stores',
    columns: [
      { name: 'id', type: 'int', isPrimary: true, isGenerated: true },
      { name: 'shop', type: 'varchar' },
      { name: 'shopifyAccessToken', type: 'varchar', isNullable: true },
      { name: 'storefrontAccessToken', type: 'varchar', isNullable: true },
      { name: 'createdAt', type: 'timestamp', default: 'NOW()' },
      { name: 'updatedAt', type: 'timestamp', default: 'NOW()' }
    ]
  })

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table)
  }
}
