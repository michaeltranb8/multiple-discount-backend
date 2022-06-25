import Store from '../entities/Store'
import { Customer, ShopifyCart } from '../global'
import TransientOrder from './createCreateDraftOrderBody/TransientOrder'
import getAvailableRules from './getAvailableRules'

// generates the body of "create draft order" function for shopify
export default async function createCreateDraftOrderBody(
  store: Store,
  cart: ShopifyCart,
  customer: Customer,
  discountCode: string[] = []
) {
  const rules = await getAvailableRules(store)
  const order = new TransientOrder(store)
  order.discountCode = discountCode
  order.setCustomer(customer)
  await order.addRules(rules)
  await order.addCart(cart)
  await order.applyRules()
  await order.findPossibleOffers(cart)
  await order.createRuleUsages()
  return order.toDraftBody()
}
