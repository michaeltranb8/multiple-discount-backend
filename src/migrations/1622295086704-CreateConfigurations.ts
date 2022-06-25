import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class CreateConfigurations1622295086704 implements MigrationInterface {
  table = new Table({
    name: 'configurations',
    columns: [
      { name: 'id', type: 'int', isPrimary: true, isGenerated: true },
      { name: 'storeId', type: 'int' },
      { name: 'themeAdapter', type: 'varchar', isNullable: false, default: "''" },
      { name: 'cartItemPriceTemplate', type: 'text', isNullable: false, default: "''" },
      { name: 'productPriceTemplate', type: 'text', isNullable: false, default: "''" },
      { name: 'createdAt', type: 'timestamp', isNullable: false, default: 'NOW()' },
      { name: 'updatedAt', type: 'timestamp', isNullable: false, default: 'NOW()' }
    ]
  })

  storeId = new TableForeignKey({
    name: 'configurations_storeId',
    columnNames: ['storeId'],
    referencedColumnNames: ['id'],
    referencedTableName: 'stores'
  })

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table)
    await queryRunner.createForeignKey(this.table, this.storeId)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(this.table, this.storeId)
    await queryRunner.dropTable(this.table)
  }
}
