import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import bodyParser from 'body-parser'

import { getStoreWithAccessToken } from '../lib/accessToken'

const router = Router()

// https://promo-dev-store.myshopify.com/admin/api/2021-01/products.json
const shopifyURLPattern = new RegExp(
  'https://.+/admin/api/2021-01/products.json',
  'g'
)

const query = `query getProductVariants($query: String, $cursor: String) {
  products(query: $query, first: 5, after: $cursor) {
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    edges {
      cursor
      node {
        legacyResourceId
        title
        variants(first: 20) {
          edges {
            node {
              legacyResourceId
              title
            }
          }
        }
      }
    }
  }
}`.replace(/\s+/g, ' ')

router.get(
  '/query',
  asyncHandler(async (req, res) => {
    const store = await getStoreWithAccessToken(req)
    const { shopify } = store
    const variables = {
      query: req.query.q ? `title:*${req.query.q}*` : '',
      cursor: req.query.cursor
    }
    const response = await shopify.query(query, variables)
    const result: any[] = []
    for (const product of response.data.data.products.edges) {
      for (const variant of product.node.variants.edges) {
        if (!result.find(v => v.id === String(variant.node.legacyResourceId))) {
          result.push({
            id: String(variant.node.legacyResourceId),
            productTitle: product.node.title,
            title: variant.node.title
          })
        }
      }
    }
    const {
      products: {
        pageInfo: { hasNextPage },
        edges
      }
    } = response.data.data
    const cursor = edges[0]?.cursor
    res.json({
      variants: result,
      hasNextPage,
      cursor
    })
  })
)

router.get(
  '/',
  bodyParser.json(),
  asyncHandler(async (req, res) => {
    const { shopify } = await getStoreWithAccessToken(req)
    const query = req.url.split('?')[1]
    const response = await shopify.getProducts(query)
    res.json({
      products: response.data,
      link: response.headers.link?.replace(shopifyURLPattern, '/products')
    })
  })
)

router.get(
  '/:id',
  bodyParser.json(),
  asyncHandler(async (req, res) => {
    const { cache } = await getStoreWithAccessToken(req)
    cache.addProduct(req.params.id)
    await cache.load()
    res.json(cache.products[req.params.id])
  })
)

export default router
