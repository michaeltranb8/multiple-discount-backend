import Big from 'big.js'
import { RuleItem } from '../../global'
import TransientItem from './TransientItem'

const byPriceAndVariantId = (selectHighPriceItems: boolean) => (a: TransientItem, b: TransientItem) => {
  if (a.price.eq(b.price)) {
    return new Big(a.variantId).sub(new Big(b.variantId)).toNumber()
  } else {
    return selectHighPriceItems ? b.price.sub(a.price).toNumber() : a.price.sub(b.price).toNumber()
  }
}

function selectItemsByItem(
  items: TransientItem[],
  ruleItem: RuleItem,
  selectHighPriceItems: boolean
): TransientItem[] {
  const matchItems = items.filter(item => item.isMatchRuleItem(ruleItem))
  matchItems.sort(byPriceAndVariantId(selectHighPriceItems))

  if (
    ruleItem.quantityType === undefined || // for legacy rules that they have no quantity type
    ruleItem.quantityType === 'exact'
  ) {
    return matchItems.length >= ruleItem.quantity
      ? matchItems.slice(0, ruleItem.quantity)
      : []
  } else {
    return matchItems.length >= ruleItem.minQuantity
      ? matchItems.slice(0, ruleItem.maxQuantity)
      : []
  }
}

export default function selectItems(
  items: TransientItem[],
  ruleItems: RuleItem[],
  aggregator: 'any' | 'all',
  selectHighPriceItems: boolean = false,
): TransientItem[] {
  if (aggregator === 'any') {
    for (const ruleItem of ruleItems) {
      const selectedItems = selectItemsByItem(items, ruleItem, selectHighPriceItems)
      if (selectedItems.length > 0) {
        return selectedItems
      }
    }
    return []
  }
  if (aggregator === 'all') {
    const itemsArray = ruleItems.map(ruleItem =>
      selectItemsByItem(items, ruleItem, selectHighPriceItems)
    )
    if (itemsArray.every(items => items.length > 0)) {
      return itemsArray.reduce((a, b) => [...a, ...b], [])
    }
    return []
  }
  throw new Error(`unknown aggregator: ${aggregator}`)
}
