import {
  Column,
  CreateDateColumn,
  Entity,
  getRepository,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import { Customer } from '../global'
import Rule from './Rule'

@Entity('discountUsages')
export default class DiscountUsage {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string
  @Column('bigint') customerId!: string
  @CreateDateColumn() createdAt!: Date
  @UpdateDateColumn() updatedAt!: Date

  @ManyToOne(() => Rule, rule => rule.discountUsages)
  rule!: Rule

  static async create(rule: Rule, customerId?: string) {
    if (!customerId) {
      return
    }
    const usage = new DiscountUsage()
    usage
    usage.rule = rule
    usage.customerId = customerId
    await getRepository(DiscountUsage).save(usage)
  }
}
