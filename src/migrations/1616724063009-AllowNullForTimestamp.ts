import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AllowNullForTimestamp1616724063009 implements MigrationInterface {
  oldStartAt = new TableColumn({
    name: 'startAt',
    type: 'timestamp',
    isNullable: false,
    default: 'NOW()'
  })

  oldEndAt = new TableColumn({
    name: 'endAt',
    type: 'timestamp',
    isNullable: false,
    default: 'NOW()'
  })

  newStartAt = new TableColumn({
    name: 'startAt',
    type: 'timestamp',
    isNullable: true
  })

  newEndAt = new TableColumn({
    name: 'endAt',
    type: 'timestamp',
    isNullable: true
  })

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn('rules', this.oldStartAt, this.newStartAt)
    await queryRunner.changeColumn('rules', this.oldEndAt, this.newEndAt)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn('rules', this.newStartAt, this.oldStartAt)
    await queryRunner.changeColumn('rules', this.newEndAt, this.oldEndAt)
  }
}
