import Big from 'big.js'

import Rule from '../../entities/Rule'
import { RuleItem, ShopifyCartItem } from '../../global'
import { ShopifyVariant } from '../../lib/Shopify'
import TransientOrder from './TransientOrder'

export interface AppliedRule {
  rule: Rule
  discount: Big
}

interface ApplyingRuleState {
  amount: Big
}

export default class TransientItem {
  order: TransientOrder
  id: number
  productId: string
  variantId: string
  isFinal: boolean

  variant: ShopifyVariant | undefined
  price: Big
  currentPrice: Big
  appliedRules: AppliedRule[]

  constructor(order: TransientOrder, cartItem: ShopifyCartItem) {
    this.order = order
    this.id = order.items.length + 1
    this.productId = cartItem.product_id
    this.variantId = cartItem.variant_id
    this.isFinal = false
    this.currentPrice = this.price = new Big(0)
    this.appliedRules = []
  }

  load() {
    this.variant = this.order.cache.productVariants[this.variantId]
    if (!this.variant) {
      throw new Error('could not find product variant in order')
    }
    this.price = new Big(this.variant.price)
    this.currentPrice = this.price
  }

  isMatchRuleItem(ruleItem: RuleItem) {
    if (ruleItem.productVariantIds.includes(this.variantId)) {
      return true
    }

    const collections = ruleItem.collectionIds.map(
      collectionId => this.order.cache.collections[collectionId]
    )
    return collections.some(
      collection => collection && collection.productIds.includes(this.productId)
    )
  }

  applyRule(rule: Rule) {
    const expectedDiscount = (() => {
      switch (rule.applyMethod) {
        case 'fixed_amount':
          return rule.applyAmount
        case 'percentage':
          return rule.isBasedOnDiscountedPrice
            ? this.currentPrice.times(rule.applyAmount).div(100)
            : this.price.times(rule.applyAmount).div(100)
        default:
          throw new Error(`unknown apply method ${rule.applyMethod}`)
      }
    })()
    const discount = expectedDiscount.gt(this.currentPrice)
      ? this.currentPrice
      : expectedDiscount
    this.currentPrice = this.currentPrice.sub(discount)
    this.appliedRules.push({ rule, discount })
  }

  get discount() {
    return this.price.sub(this.currentPrice)
  }
}
