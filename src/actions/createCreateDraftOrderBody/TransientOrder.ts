import Big from 'big.js'
import { flatten } from 'lodash'
import DiscountUsage from '../../entities/DiscountUsage'

import Rule from '../../entities/Rule'
import Store from '../../entities/Store'
import {
  CreateDraftOrderBody,
  Customer,
  LineItem,
  RuleItem,
  ShopifyCart
} from '../../global'
import applyDiscount from './applyDiscount'
import isConditionMatch from './isConditionMatch'
import selectItems from './selectItems'
import TransientItem, { AppliedRule } from './TransientItem'
import TransientLine from './TransientLine'

interface TransientOrderPossibleOffer {
  variantId: string
  quantity: number
  originalPrice: Big
  total: Big
  appliedDiscount: Big
  appliedRules: Rule[]
  isFree: boolean
}

// stores all data from shopify (or cache), all unsaved line items and states for
// draft order
export default class TransientOrder {
  store: Store
  customerId: string | undefined
  customerTags: string[]
  rules: Rule[]
  items: TransientItem[]
  lines: TransientLine[]
  appliedRules: AppliedRule[]
  isFinal: boolean
  isFreeShipping: boolean
  possibleOfferItems: RuleItem[]
  possibleOffers: TransientOrderPossibleOffer[]
  discountCode: string[]

  constructor(store: Store) {
    this.store = store
    this.customerTags = []
    this.rules = []
    this.items = []
    this.lines = []
    this.appliedRules = []
    this.isFinal = false
    this.isFreeShipping = false
    this.possibleOfferItems = []
    this.possibleOffers = []
    this.discountCode = []
  }

  setCustomer({ id, tags }: Customer) {
    this.customerId = id
    this.customerTags = tags
  }

  async addRule(rule: Rule) {
    for (const bundleItem of rule.bundleItems) {
      for (const id of bundleItem.productVariantIds) {
        this.cache.addProductVariant(id)
      }
      for (const id of bundleItem.collectionIds) {
        this.cache.addCollection(id)
      }
    }
    if (rule.offerItems) {
      for (const offerItem of rule.offerItems) {
        for (const id of offerItem.productVariantIds) {
          this.cache.addProductVariant(id)
        }
        for (const id of offerItem.collectionIds) {
          this.cache.addCollection(id)
        }
      }
    }
    this.rules.push(rule)
  }

  async addRules(rules: Rule[]) {
    for (const rule of rules) {
      await this.addRule(rule)
    }
  }

  async addCart(cart: ShopifyCart) {
    for (const item of cart.items) {
      this.cache.addProductVariant(item.variant_id)
      for (let i = 0; i < item.quantity; i++) {
        this.items.push(new TransientItem(this, item))
      }
    }
  }

  async load() {
    await this.cache.load()
    for (const item of this.items) {
      item.load()
    }
  }

  findProductVariant(id: string) {
    return this.cache.productVariants[id]
  }

  findAllItemsByRuleItem(ruleItem: RuleItem) {
    return this.items.filter(item => item.isMatchRuleItem(ruleItem))
  }

  totalSpendingWithBundledItems(rule: Rule) {
    let total = new Big(0)
    let remainingItems = this.items

    while (true) {
      const items = selectItems(
        remainingItems,
        rule.bundleItems,
        rule.bundleItemsAggregator
      )
      if (items.length === 0) {
        break
      }
      for (const item of items) {
        total = total.add(item.price)
        remainingItems = remainingItems.filter(i => i.id !== item.id)
      }
    }
    return total
  }

  async applyRules() {
    await this.load()
    for (const rule of this.rules) {
      if (await isConditionMatch(rule, this)) {
        applyDiscount(rule, this)

        const offerItems = rule.isSameItems ? rule.bundleItems : rule.offerItems
        this.possibleOfferItems = [...this.possibleOfferItems, ...offerItems]
      }
    }
  }

  applyDiscount(rule: Rule) {
    switch (rule.applyMethod) {
      case 'total_amount':
        this.appliedRules.push({
          rule,
          discount: rule.applyAmount
        })
        break
      case 'total_percentage':
        this.appliedRules.push({
          rule,
          discount: this.originalSubtotal.times(rule.applyAmount).div(100)
        })
    }
  }

  createLineItems() {
    const lineItems: TransientLine[] = []

    for (const item of this.items) {
      let lineItem = lineItems.find(
        lineItem => lineItem.variantId === item.variantId
      )
      if (!lineItem) {
        lineItem = new TransientLine(this, item.variantId)
        lineItems.push(lineItem)
      }
      lineItem.addItem(item)
    }

    return lineItems
  }

  async createRuleUsages() {
    for (const appliedRule of this.appliedRules) {
      const { rule } = appliedRule
      await DiscountUsage.create(rule, this.customerId)
    }
  }

  toDraftBody(): CreateDraftOrderBody {
    const lineItems = this.createLineItems()

    return {
      draft_order: {
        line_items: [
          ...lineItems.map<LineItem>(item => ({
            variant_id: item.variantId,
            quantity: item.quantity,
            applied_discount: {
              title: 'Discount',
              description: item.appliedRuleNames,
              value_type: 'fixed_amount',
              value: item.averageOfDiscounts.toFixed(4),
              amount: item.averageOfDiscounts.toFixed(4)
            }
          })),
          ...this.possibleOffers
            .filter(offer => offer.isFree)
            .map<LineItem>(offer => ({
              variant_id: offer.variantId,
              quantity: offer.quantity,
              applied_discount: {
                title: 'Free',
                description: 'Auto added',
                value_type: 'percentage',
                value: '100.00',
                amount: '100.00'
              }
            }))
        ],
        applied_discount: {
          title: 'Discount',
          description: this.appliedRuleNames,
          value_type: 'fixed_amount',
          value: this.sumOfCartDiscounts.toFixed(4),
          amount: this.sumOfCartDiscounts.toFixed(4)
        },
        shipping_line: this.isFreeShipping
          ? { title: 'Free shipping (Promotion)', price: 0 }
          : undefined
      }
    }
  }

  toDiscounts() {
    const lineItems = this.createLineItems()

    return {
      lineItems: lineItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
        appliedRules: item.appliedRules.map(appliedRule => ({
          name: appliedRule.rule.name,
          discount: appliedRule.discount
        })),
        appliedDiscount: item.sumOfDiscounts,
        originalPrice: item.originalPrice,
        total: item.total
      })),
      appliedRules: this.appliedRules.map(appliedRule => ({
        name: appliedRule.rule.name,
        discount: appliedRule.discount
      })),
      originalSubtotal: this.originalSubtotal,
      sumOfDiscounts: this.sumOfCartDiscounts,
      subtotal: this.subtotal,
      shippingLine: this.isFreeShipping
        ? {
            title: 'Free shipping (Promotion)',
            custom: true,
            handle: null,
            price: '0.00'
          }
        : undefined,
      possibleOffers: this.possibleOffers
    }
  }

  get totalSpending() {
    return this.items.reduce(
      (spending, item) => spending.add(item.currentPrice),
      new Big(0)
    )
  }

  get totalItemsCount() {
    return this.items.length
  }

  get originalSubtotal() {
    // sum(item currentPrices)
    return this.items.reduce(
      (total, item) => total.add(item.currentPrice),
      new Big(0)
    )
  }

  // the final price (without shipping fee)
  get subtotal() {
    // originalSubtotal - sumOfCartDiscounts
    return this.originalSubtotal.sub(this.sumOfCartDiscounts)
  }

  // discount for the whole cart
  get sumOfCartDiscounts() {
    return this.appliedRules.reduce((a, b) => a.add(b.discount), new Big(0))
  }

  // the discount with all items discount
  get sumOfDiscounts() {
    // sum(cart discount) + sum(item discounts)
    return this.sumOfCartDiscounts.add(
      this.items.reduce((a, b) => a.add(b.discount), new Big(0))
    )
  }

  // the average discount that only used in the draft order api
  get averageOfDiscounts() {
    if (this.appliedRules.length !== 0) {
      return this.sumOfCartDiscounts.div(this.appliedRules.length)
    } else {
      return new Big(0)
    }
  }

  get appliedRuleNames() {
    return this.appliedRules
      .map(appliedRule => appliedRule.rule.name)
      .join(', ')
  }

  getProductVariantsFromCollection(id: string) {
    const collection = this.cache.collections[id]
    if (!collection) {
      // the id may refers to a smart collection that will not store in the cache
      // for backward compatibility, return an empty array to acts as an empty collection
      console.warn(`collection not found: ${id}`)
      return []
    }
    return flatten(
      collection.productIds.map(id => this.getProductVariantsFromProduct(id))
    )
  }

  getProductVariantsFromProduct(id: string) {
    return Object.values(this.cache.productVariants).filter(
      variant => String(variant.product_id) === id
    )
  }

  getProductVariantById(id: string) {
    const productVariant = this.cache.productVariants[id]
    if (!productVariant) {
      throw new Error(`product variant not found: ${id}`)
    }
    return productVariant
  }

  getProductVariantsFromRuleItem(ruleItem: RuleItem) {
    const listVariant: string[] = []
    ruleItem.productVariantIds.map(id => {
      let result = this.cache.productVariants[id]
      if (result) {
        listVariant.push(id)
      }
    })

    return [
      ...flatten(
        ruleItem.collectionIds.map(id =>
          this.getProductVariantsFromCollection(id)
        )
      ),
      ...listVariant.map(id => this.getProductVariantById(id))
    ]
  }

  get possibleOfferVariants() {
    return flatten(
      this.possibleOfferItems.map(offerItem =>
        this.getProductVariantsFromRuleItem(offerItem)
      )
    ).filter(
      // dedupe variants
      (variant, index, all) => all.findIndex(v => v.id === variant.id) === index
    )
  }

  // NOTE: should the original cart keep in the order? needs a big refactor
  async findPossibleOffers(cart: ShopifyCart) {
    for (const variant of this.possibleOfferVariants) {
      const newOrder = this.derive()
      await newOrder.addCart(cart)
      await newOrder.addCart({
        token: '',
        note: '',
        items: [
          {
            product_id: variant.product_id,
            variant_id: variant.id,
            quantity: 1
          }
        ]
      })
      await newOrder.applyRules()

      const originalPrice = new Big(variant.price)
      // newOrder.subtotal - this.subtotal
      const total = newOrder.subtotal.sub(this.subtotal)
      // originalPrice - total
      const appliedDiscount = originalPrice.sub(total)
      this.possibleOffers.push({
        variantId: variant.id,
        quantity: 1,
        originalPrice,
        total,
        appliedDiscount,
        appliedRules: [],
        isFree: total.eq(0)
      })
    }

    this.possibleOffers = this.possibleOffers.filter(
      offer => !offer.appliedDiscount.eq(0)
    )
  }

  get cache() {
    return this.store.cache
  }

  // creates an empty order that uses cached data
  derive() {
    const order = new TransientOrder(this.store)
    order.rules = this.rules
    return order
  }
}
