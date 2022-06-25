import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class CreateRules1614224747316 implements MigrationInterface {
  table = new Table({
    name: 'rules',
    columns: [
      // information
      { name: 'id', type: 'int', isPrimary: true, isGenerated: true },
      { name: 'storeId', type: 'int' },
      { name: 'name', type: 'varchar', isNullable: false, default: "''" },
      { name: 'description', type: 'varchar', isNullable: false, default: "''" },
      { name: 'status', type: 'boolean', isNullable: false, default: false },
      // availability
      { name: 'customerGroups', type: 'varchar', isArray: true },
      { name: 'customerIncludeTags', type: 'varchar', isNullable: false, default: "''" },
      { name: 'customerExcludeTags', type: 'varchar', isNullable: false, default: "''" },
      { name: 'timeZone', type: 'varchar', isNullable: false, default: "''" },
      { name: 'startAt', type: 'timestamp', isNullable: false, default: 'NOW()' },
      { name: 'endAt', type: 'timestamp', isNullable: false, default: 'NOW()' },
      { name: 'priority', type: 'int', isNullable: false, default: 0 },
      { name: 'isIgnoreSubsequentRules', type: 'boolean', isNullable: false, default: false },
      { name: 'isIgnoreSubsequentRulesByItem', type: 'boolean', isNullable: false, default: false },
      { name: 'isMostExpensiveFirst', type: 'boolean', isNullable: false, default: false },
      { name: 'isBasedOnDiscountedPrice', type: 'boolean', isNullable: false, default: false },
      // conditions
      { name: 'conditionAggregator', type: 'varchar', isNullable: false, default: "'any'" },
      { name: 'hasTotalSpendingGoal', type: 'boolean', isNullable: false, default: false },
      { name: 'totalSpendingGoal', type: 'int', isNullable: false, default: 0 },
      { name: 'isTotalSpendingGoalWithBundledItems', type: 'boolean', isNullable: false, default: false },
      { name: 'hasTotalItemsGoal', type: 'boolean', isNullable: false, default: false },
      { name: 'totalItemsCountGoal', type: 'int', isNullable: false, default: 0 },
      // items for conditions
      { name: 'bundleItemsAggregator', type: 'varchar', isNullable: false, default: "'any'" },
      { name: 'bundleItems', type: 'jsonb', isNullable: false, default: "'[]'::jsonb" },
      // offer
      { name: 'maxQuantityOfDiscounts', type: 'int', isNullable: false, default: 0 },
      { name: 'offerItems', type: 'jsonb', isNullable: false, default: "'[]'::jsonb" },
      // actions
      { name: 'isFreeShipping', type: 'boolean', isNullable: false, default: false },
      { name: 'applyMethod', type: 'varchar', isNullable: false, default: "'fixed_amount'" },
      { name: 'applyAmount', type: 'int', isNullable: false, default: 0 },
      // misc.
      { name: 'createdAt', type: 'timestamp', isNullable: false, default: 'NOW()' },
      { name: 'updatedAt', type: 'timestamp', isNullable: false, default: 'NOW()' }
    ]
  })

  storeId = new TableForeignKey({
    name: 'rules_storeId',
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
