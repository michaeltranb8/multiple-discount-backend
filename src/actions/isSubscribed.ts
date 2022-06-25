import Store from '../entities/Store'

export async function isSubscribed (store: Store) {
  if (store.chargeId == null) {
    return false
  }
  const { data: charge } = await store.shopify.getCharge(store.chargeId)
  return charge.status === 'active'
}
