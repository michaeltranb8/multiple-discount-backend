export declare interface Customer {
  id?: string
  tags: string[]
}

export declare interface DraftBody {
  shop: string
  cart: ShopifyCart
  customer: Customer
}

export declare type LineItem = ExistingLineItem | CustomLineItem

export declare interface ExistingLineItem {
  variant_id: string
  quantity: number
  applied_discount?: AppliedDiscount
}

export declare interface CustomLineItem {
  title: string
  price: string
  quantity: number
  applied_discount?: AppliedDiscount
}

export declare interface AppliedDiscount {
  title: string
  description: string
  value_type: 'fixed_amount' | 'percentage'
  value: string
  amount: string
}

export declare interface CreateDraftOrderBody {
  draft_order: {
    line_items: LineItem[]
    applied_discount?: AppliedDiscount
    customer?: {
      id: string
    }
    use_customer_default_address?: boolean
    shipping_line?: {
      title: string
      price: number
    }
  }
}

export declare interface ShopifyCart {
  token: string
  note: string
  items: ShopifyCartItem[]
}

export declare interface ShopifyCartItem {
  product_id: string
  variant_id: string
  quantity: number
}

export declare interface RuleItem {
  productVariantIds: string[]
  collectionIds: string[]
  quantityType?: 'exact' | 'ranged'
  quantity: number
  minQuantity: number
  maxQuantity: number
}
