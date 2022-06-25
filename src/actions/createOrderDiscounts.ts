import Store from '../entities/Store'
import { DraftBody } from '../global'
import TransientOrder from './createCreateDraftOrderBody/TransientOrder'
import getAvailableRules from './getAvailableRules'

export default async function createOrderDiscounts(
  store: Store,
  draftBody: DraftBody,
  discountCode: string[] = []
) {
  const rules = await getAvailableRules(store)
  const order = new TransientOrder(store)
  order.discountCode = discountCode
  order.setCustomer(draftBody.customer)
  await order.addRules(rules)
  await order.addCart(draftBody.cart)
  await order.applyRules()
  await order.findPossibleOffers(draftBody.cart)
  return order.toDiscounts()
}
