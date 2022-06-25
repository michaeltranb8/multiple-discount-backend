import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class ChangeApplyAmountToDecimal1614807362722 implements MigrationInterface {
  oldColumn = new TableColumn({
    name: 'applyAmount',
    type: 'int',
    isNullable: false,
    default: 0
  })

  newColumn = new TableColumn({
    name: 'applyAmount',
    type: 'decimal',
    precision: 18,
    scale: 4,
    isNullable: false,
    default: 0
  })

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn('rules', this.oldColumn, this.newColumn)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn('rules', this.newColumn, this.oldColumn)
  }
}
