import Big from 'big.js'

import createOrderDiscounts from '../actions/createOrderDiscounts'
import Store from '../entities/Store'
import { DraftBody } from '../global'
import { ShopifyVariant } from '../lib/Shopify'

function addVariantToDraftBody(
  draftBody: DraftBody,
  variant: ShopifyVariant
): DraftBody {
  if (draftBody.cart.items.find(item => item.variant_id === variant.id)) {
    return {
      ...draftBody,
      cart: {
        ...draftBody.cart,
        items: draftBody.cart.items.map(item =>
          item.variant_id === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
    }
  } else {
    return {
      ...draftBody,
      cart: {
        ...draftBody.cart,
        items: [
          ...draftBody.cart.items,
          {
            product_id: variant.product_id,
            variant_id: variant.id,
            quantity: 1
          }
        ]
      }
    }
  }
}

export default async function getAddPrice(
  store: Store,
  draftBody: DraftBody,
  productVariantId: number
) {
  const { cache } = store
  cache.addProductVariant(productVariantId)
  await cache.load()
  const variant = cache.productVariants[productVariantId]
  const originalPrice = new Big(variant.price)

  const beforeDiscount = await createOrderDiscounts(store, draftBody)
  const afterDiscount = await createOrderDiscounts(
    store,
    addVariantToDraftBody(draftBody, variant)
  )

  const beforeSubtotal = new Big(beforeDiscount.subtotal)
  const afterSubtotal = new Big(afterDiscount.subtotal)
  const finalPrice = afterSubtotal.sub(beforeSubtotal)

  return {
    price: originalPrice.toFixed(2),
    finalPrice: finalPrice.toFixed(2),
    discount: originalPrice.sub(finalPrice).toFixed(2)
  }
}
