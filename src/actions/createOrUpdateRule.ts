import { validate } from 'class-validator'
import { getRepository } from 'typeorm'
import Rule from '../entities/Rule'

interface CreateOrUpdateRule {
  name: string
  description: string
  status: boolean
  customerGroups: string[]
  customerIncludeTags: string
  customerExcludeTags: string
  startAt: Date
  endAt: Date
  priority: number
  isIgnoreSubsequentRules: boolean
  isIgnoreSubsequentRulesByItem: boolean
  isMostExpensiveFirst: boolean
  isBasedOnDiscountedPrice: boolean
  conditionAggregator: string
  hasDiscountCode: boolean
  discountCode?: string
  hasTotalSpendingGoal: boolean
  totalSpendingGoal: number
  isTotalSpendingGoalWithBundledItems: boolean
  hasTotalItemsGoal: boolean
  totalItemsCountGoal: number
  bundleItemsAggregator: string
  bundleItems: {
    productVariantIds: string[]
    collectionIds: string[]
    quantity: number
  }[]
  maxQuantityOfDiscounts: number
  offerItems: {
    productVariantIds: string[]
    collectionIds: string[]
    quantity: number
  }[]
  isFreeShipping: boolean
  applyMethod: string
  applyAmount: number
  createdAt: Date
  updatedAt: Date
}

class ValidationError extends Error {
  fields

  constructor(fields: any) {
    super()
    this.fields = fields
  }
}

export default async function createOrUpdateRule(
  rule: Rule,
  props: CreateOrUpdateRule
) {
  Object.assign(rule, props)
  const errors = await validate(rule, { validationError: { target: false } })
  if (errors.length > 0) {
    throw new ValidationError(errors)
  } else {
    return await getRepository(Rule).save(rule)
  }
}
