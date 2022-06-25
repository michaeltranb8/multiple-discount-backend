import Big from 'big.js'
import {
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator'
import {
  Column,
  CreateDateColumn,
  Entity,
  getRepository,
  ManyToOne,
  Not,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import { RuleItem } from '../global'
import DiscountUsage from './DiscountUsage'
import Store from './Store'

@ValidatorConstraint({ async: true })
class UniqueDiscountCode implements ValidatorConstraintInterface {
  async validate(
    value: any,
    validationArguments: ValidationArguments
  ): Promise<boolean> {
    const rule = validationArguments.object as Rule
    if (!rule.hasDiscountCode) {
      return true
    }
    if (rule.hasDiscountCode && !rule.discountCode) {
      return false
    }
    const repo = getRepository(Rule)
    const conditions = rule.id
      ? { id: Not(rule.id), discountCode: value }
      : { discountCode: value }
    return repo.count({ where: conditions }).then(count => count === 0)
  }

  defaultMessage() {
    return 'discount code should be unique'
  }
}

@Entity('rules')
export default class Rule {
  @PrimaryGeneratedColumn() id!: number
  // information
  @Column('varchar', { default: '' }) name!: string
  @Column('varchar', { default: '' }) description!: string
  @Column('boolean', { default: false }) status!: boolean
  // availability
  @Column('varchar', { array: true }) customerGroups!: string[]
  // customer
  @Column('varchar', {
    default: '',
    transformer: {
      from(value) {
        return String(value)
          .split(',')
          .map(tag => tag.trim())
      },
      to(value = []) {
        return Array.isArray(value) ? value.join(', ') : value;
      }
    }
  })
  customerIncludeTags!: string[]
  @Column('varchar', {
    default: '',
    transformer: {
      from(value) {
        return String(value)
          .split(',')
          .map(tag => tag.trim())
      },
      to(value = []) {
        return Array.isArray(value) ? value.join(', ') : value;
      }
    }
  })
  customerExcludeTags!: string[]
  @Column('boolean', { default: false }) isOncePerCustomer!: boolean
  @Column('timestamp', { nullable: true }) startAt!: Date
  @Column('timestamp', { nullable: true }) endAt!: Date
  @Column('int', { default: 0 }) priority!: number
  @Column('boolean', { default: false }) isIgnoreSubsequentRules!: boolean
  @Column('boolean', { default: false }) isIgnoreSubsequentRulesByItem!: boolean
  @Column('boolean', { default: false }) isMostExpensiveFirst!: boolean
  @Column('boolean', { default: false }) isBasedOnDiscountedPrice!: boolean
  // conditions
  @Column('varchar', { default: 'any' }) conditionAggregator!: 'any' | 'all'
  @Column('boolean', { default: false }) hasDiscountCode!: boolean
  @Validate(UniqueDiscountCode)
  @Column('varchar', { nullable: true, unique: true })
  discountCode!: string | undefined
  @Column('boolean', { default: false }) hasTotalSpendingGoal!: boolean
  @Column('int', { default: 0 }) totalSpendingGoal!: number
  @Column('boolean', { default: false })
  isTotalSpendingGoalWithBundledItems!: boolean
  @Column('boolean', { default: false }) hasTotalItemsGoal!: boolean
  @Column('int', { default: 0 }) totalItemsCountGoal!: number
  // items for conditions
  @Column('boolean', { default: true }) hasBundleItems!: boolean
  @Column('varchar', { default: 'any' }) bundleItemsAggregator!: 'any' | 'all'
  @Column('jsonb', { default: [] }) bundleItems!: RuleItem[]
  // offer
  @Column('boolean', { default: false }) isLimitedTriggerCount!: boolean
  @Column('int', { default: 0 }) maxQuantityOfDiscounts!: number
  @Column('boolean', { default: false }) isSameItems!: boolean
  @Column('jsonb', { default: [] }) offerItems!: RuleItem[]
  // actions
  @Column('boolean', { default: false }) isFreeShipping!: boolean
  @Column('varchar', { default: 'fixed_amount' }) applyMethod!:
    | 'fixed_amount'
    | 'percentage'
    | 'total_amount'
    | 'total_percentage'
  @Column('decimal', {
    precision: 18,
    scale: 4,
    default: 0,
    transformer: {
      from(value) {
        return new Big(value)
      },
      to(value) {
        return new Big(value).toFixed(4)
      }
    }
  })
  applyAmount!: Big
  // misc.
  @CreateDateColumn() createdAt!: Date
  @UpdateDateColumn() updatedAt!: Date

  @ManyToOne(() => Store, store => store.rules)
  store!: Store

  @OneToMany(() => DiscountUsage, discountUsage => discountUsage.rule, {
    onDelete: 'CASCADE'
  })
  discountUsages!: DiscountUsage[]

  asJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      status: this.status,
      customerGroups: this.customerGroups,
      customerIncludeTags: this.customerIncludeTags,
      customerExcludeTags: this.customerExcludeTags,
      isOncePerCustomer: this.isOncePerCustomer,
      startAt: this.startAt,
      endAt: this.endAt,
      priority: this.priority,
      isIgnoreSubsequentRules: this.isIgnoreSubsequentRules,
      isIgnoreSubsequentRulesByItem: this.isIgnoreSubsequentRulesByItem,
      isMostExpensiveFirst: this.isMostExpensiveFirst,
      isBasedOnDiscountedPrice: this.isBasedOnDiscountedPrice,
      conditionAggregator: this.conditionAggregator,
      hasDiscountCode: this.hasDiscountCode,
      discountCode: this.discountCode,
      hasTotalSpendingGoal: this.hasTotalSpendingGoal,
      totalSpendingGoal: this.totalSpendingGoal,
      isTotalSpendingGoalWithBundledItems:
        this.isTotalSpendingGoalWithBundledItems,
      hasTotalItemsGoal: this.hasTotalItemsGoal,
      totalItemsCountGoal: this.totalItemsCountGoal,
      hasBundleItems: this.hasBundleItems,
      bundleItemsAggregator: this.bundleItemsAggregator,
      bundleItems: this.bundleItems,
      isLimitedTriggerCount: this.isLimitedTriggerCount,
      maxQuantityOfDiscounts: this.maxQuantityOfDiscounts,
      isSameItems: this.isSameItems,
      offerItems: this.offerItems,
      isFreeShipping: this.isFreeShipping,
      applyMethod: this.applyMethod,
      applyAmount: this.applyAmount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}
