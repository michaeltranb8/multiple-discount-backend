import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class RemoveTimeZoneFromRules1615775805847 implements MigrationInterface {
  timeZone = new TableColumn({
    name: 'timeZone',
    type: 'string',
    isNullable: false,
    default: "''"
  })

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('rules', this.timeZone)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('rules', this.timeZone)
  }
}
