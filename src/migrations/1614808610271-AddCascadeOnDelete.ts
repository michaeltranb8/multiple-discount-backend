import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm'

export class AddCascadeOnDelete1614808610271 implements MigrationInterface {
  oldForeignKey = new TableForeignKey({
    name: 'rules_storeId',
    columnNames: ['storeId'],
    referencedColumnNames: ['id'],
    referencedTableName: 'stores'
  })

  newForeignKey = new TableForeignKey({
    name: 'rules_storeId',
    columnNames: ['storeId'],
    referencedColumnNames: ['id'],
    referencedTableName: 'stores',
    onDelete: 'CASCADE'
  })

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('rules', this.oldForeignKey)
    await queryRunner.createForeignKey('rules', this.newForeignKey)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('rules', this.newForeignKey)
    await queryRunner.createForeignKey('rules', this.oldForeignKey)
  }
}
