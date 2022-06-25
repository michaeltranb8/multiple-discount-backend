import Rule from '../../entities/Rule'
import selectItems from './selectItems'
import TransientOrder from './TransientOrder'

export default function applyDiscount(rule: Rule, order: TransientOrder) {
  // if no bundle and no offer items, rule should be applied only once
  // ex. buy anything get anything
  if (!rule.hasBundleItems && rule.isSameItems) {
    applyDiscountWithCart(rule, order)
  } else {
    applyDiscountWithItems(rule, order)
  }

  if (rule.isIgnoreSubsequentRules) {
    order.isFinal = true
  }
  if (rule.isFreeShipping) {
    order.isFreeShipping = true
  }
}

function applyDiscountWithCart(rule: Rule, order: TransientOrder) {
  if (
    rule.applyMethod === 'total_amount' ||
    rule.applyMethod === 'total_percentage'
  ) {
    order.applyDiscount(rule)
  } else {
    // do nothing since percentage and fixed_amount are only for items
  }
}

function applyDiscountWithItems(rule: Rule, order: TransientOrder) {
  const ruleItems = rule.isSameItems ? rule.bundleItems : rule.offerItems

  let remainingTriggerCount = rule.isLimitedTriggerCount
    ? rule.maxQuantityOfDiscounts || Number.MAX_SAFE_INTEGER
    : Number.MAX_SAFE_INTEGER
  let remainingItems = order.items.filter(item => !item.isFinal)

  while (remainingTriggerCount > 0) {
    // 1. Check bundle items are in the order
    const bundleItems = selectItems(
      remainingItems,
      rule.bundleItems,
      rule.bundleItemsAggregator,
      true
    )
    if (rule.hasBundleItems && bundleItems.length === 0) {
      break
    }
    // 2. Get offer items in the orders
    const offerItems = selectItems(
      remainingItems,
      ruleItems,
      rule.bundleItemsAggregator
    )
    if (offerItems.length === 0) {
      break
    }
    // 3. Apply offer items discount
    if (
      rule.applyMethod === 'total_amount' ||
      rule.applyMethod === 'total_percentage'
    ) {
      order.applyDiscount(rule)
    } else {
      offerItems.forEach(item => {
        item.applyRule(rule)
      })
    }
    // 4. Remove offer items and bundle item
    const removingItems = bundleItems.concat(offerItems)
    if (rule.isIgnoreSubsequentRulesByItem) {
      removingItems.forEach(item => {
        item.isFinal = true
      })
    }
    remainingItems = remainingItems.filter(
      item => !removingItems.includes(item)
    )

    remainingTriggerCount -= 1
  }
}
