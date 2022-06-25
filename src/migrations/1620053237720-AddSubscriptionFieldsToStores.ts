import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddSubscriptionFieldsToStores1620053237720 implements MigrationInterface {
  subscriptionState = new TableColumn({
    name: 'subscriptionState',
    type: 'varchar',
    isNullable: true
  })
  chargeId = new TableColumn({
    name: 'chargeId',
    type: 'bigint',
    isNullable: true
  })

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('stores', this.subscriptionState)
    await queryRunner.addColumn('stores', this.chargeId)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('stores', this.chargeId)
    await queryRunner.dropColumn('stores', this.subscriptionState)
  }
}
