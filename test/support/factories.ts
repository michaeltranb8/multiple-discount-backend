import TransientOrder from '../../src/actions/createCreateDraftOrderBody/TransientOrder'
import Store from '../../src/entities/Store'
import { ShopifyCartItem } from '../../src/global'

export async function createOrder (store: Store, items: ShopifyCartItem[]) {
  const order = new TransientOrder(store)
  await order.addCart({
    token: 'whatever',
    note: 'whatever',
    items
  })
  await order.load()
  return order
}
