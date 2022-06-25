import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddIsLimitedTriggerCountToRules1618797816124 implements MigrationInterface {
  isLimitedTriggerCount = new TableColumn({
    name: 'isLimitedTriggerCount',
    type: 'boolean',
    isNullable: false,
    default: false
  })

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('rules', this.isLimitedTriggerCount)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('rules', this.isLimitedTriggerCount)
  }
}
