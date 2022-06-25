import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class DropConfigurations1624267243295 implements MigrationInterface {
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

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table)
  }
}
