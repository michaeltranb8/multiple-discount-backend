import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateRequestCache1614810355987 implements MigrationInterface {
  table = new Table({
    name: 'request_cache',
    columns: [
      { name: 'id', type: 'int', isPrimary: true, isGenerated: true },
      { name: 'url', type: 'varchar' },
      { name: 'responseBody', type: 'jsonb', isNullable: true },
      { name: 'createdAt', type: 'timestamp', default: 'NOW()' }
    ]
  })

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table)
  }
}
