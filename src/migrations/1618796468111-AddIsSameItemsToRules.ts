import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddIsSameItemsToRules1618796468111 implements MigrationInterface {
  isSameItems = new TableColumn({
    name: 'isSameItems',
    type: 'boolean',
    isNullable: false,
    default: false
  })

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('rules', this.isSameItems)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('rules', this.isSameItems)
  }
}
