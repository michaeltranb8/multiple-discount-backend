import Big from 'big.js'

import Rule from '../../entities/Rule'
import { ShopifyCartItem } from '../../global'
import TransientItem from './TransientItem'
import TransientOrder from './TransientOrder'

interface AppliedRule {
  rule: Rule
  discount: Big
}

export default class TransientLine {
  order: TransientOrder
  variantId: string
  isFinal: boolean
  items: TransientItem[]
  appliedRules: AppliedRule[]

  constructor(order: TransientOrder, variantId: string) {
    this.order = order
    this.variantId = variantId
    this.isFinal = false
    this.items = []
    this.appliedRules = []
  }

  addItem(item: TransientItem) {
    this.items.push(item)

    for (const itemAppliedRule of item.appliedRules) {
      const lineAppliedRule = this.appliedRules.find(
        appliedRule => appliedRule.rule.id === itemAppliedRule.rule.id
      )
      if (lineAppliedRule) {
        lineAppliedRule.discount = lineAppliedRule.discount.add(
          itemAppliedRule.discount
        )
      } else {
        this.appliedRules.push(itemAppliedRule)
      }
    }
  }

  get quantity() {
    return this.items.length
  }

  get sumOfDiscounts() {
    return this.items.reduce((a, b) => a.add(b.discount), new Big(0))
  }

  get averageOfDiscounts() {
    return this.sumOfDiscounts.div(this.quantity)
  }

  get total() {
    return this.items.reduce((a, b) => a.add(b.currentPrice), new Big(0))
  }

  get originalPrice() {
    return this.items.reduce((a, b) => a.add(b.price), new Big(0))
  }

  get appliedRuleNames() {
    return this.appliedRules
      .map(appliedRule => appliedRule.rule.name)
      .join(', ')
  }
}
