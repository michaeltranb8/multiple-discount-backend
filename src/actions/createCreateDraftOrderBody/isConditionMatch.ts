import { getRepository } from 'typeorm'
import DiscountUsage from '../../entities/DiscountUsage'
import Rule from '../../entities/Rule'
import selectItems from './selectItems'
import TransientOrder from './TransientOrder'

function isDiscountCodeMatch(rule: Rule, order: TransientOrder) {
  return (
    rule.discountCode &&
    order.discountCode &&
    order.discountCode.includes(rule.discountCode)
  )
}

async function isUsed(rule: Rule, order: TransientOrder) {
  if (!rule.isOncePerCustomer) {
    return false
  }
  if (!order.customerId) {
    return true
  }
  const usageCount = await getRepository(DiscountUsage).count({
    where: { rule, customerId: order.customerId }
  })
  return usageCount > 0
}

export function isGroupMatch(rule: Rule, order: TransientOrder) {
  if (rule.customerGroups) {
    if (rule.customerGroups.includes('customerIncludeTags')) {
      // fail if not every tag includes
      if (
        !rule.customerIncludeTags.every(tag => order.customerTags.includes(tag))
      ) {
        return false
      }
    }
    if (rule.customerGroups.includes('customerExcludeTags')) {
      // fail if any tag includes
      if (
        rule.customerExcludeTags.some(tag => order.customerTags.includes(tag))
      ) {
        return false
      }
    }
    if (rule.customerGroups.includes('memberOnly')) {
      return order.customerId != null
    }
  }
  return true
}

export function isAnyLineItemFinal(rule: Rule, order: TransientOrder) {
  if (!rule.isIgnoreSubsequentRulesByItem) {
    return false
  }
  for (const offerItem of rule.offerItems) {
    const items = order.findAllItemsByRuleItem(offerItem)
    if (items.length === 0) {
      continue
    }
    if (items.some(item => item.isFinal)) {
      return true
    }
  }
}

export function isReachSpendingGoal(rule: Rule, order: TransientOrder) {
  if (!rule.hasTotalSpendingGoal) {
    return true
  }
  if (rule.isTotalSpendingGoalWithBundledItems) {
    return order.totalSpendingWithBundledItems(rule).gt(rule.totalSpendingGoal)
  } else {
    return order.totalSpending.gt(rule.totalSpendingGoal)
  }
}

export default async function isConditionMatch(
  rule: Rule,
  order: TransientOrder
) {
  if (order.isFinal) {
    return false
  }
  if (await isUsed(rule, order)) {
    return false
  }
  if (rule.hasDiscountCode && !isDiscountCodeMatch(rule, order)) {
    return false
  }
  if (isAnyLineItemFinal(rule, order)) {
    return false
  }
  if (!isGroupMatch(rule, order)) {
    return false
  }
  if (!isReachSpendingGoal(rule, order)) {
    return false
  }
  if (
    rule.hasTotalItemsGoal &&
    order.totalItemsCount < rule.totalItemsCountGoal
  ) {
    return false
  }
  if (rule.hasBundleItems) {
    const bundleItems = selectItems(
      order.items,
      rule.bundleItems,
      rule.bundleItemsAggregator
    )
    return bundleItems.length > 0
  }
  return true
}
