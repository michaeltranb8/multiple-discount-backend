import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import bodyParser from 'body-parser'

import Shopify from '../lib/Shopify'
import { getStoreWithAccessToken } from '../lib/accessToken'

const router = Router()

const shopifyURLPattern = new RegExp(
  'https://.+/admin/api/2021-01/collections.json',
  'g'
)

const query = `query getCollections($query: String, $cursor: String) {
  collections(query: $query, first: 20, after: $cursor) {
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    edges {
      cursor
      node {
        legacyResourceId
        title
      }
    }
  }
}`.replace(/\s+/g, ' ')

router.get(
  '/query',
  asyncHandler(async (req, res) => {
    const store = await getStoreWithAccessToken(req)
    const shopify = Shopify.fromStore(store)
    const variables = {
      query: req.query.q
        ? `title:*${req.query.q}* collection_type:custom`
        : 'collection_type:custom',
      cursor: req.query.cursor
    }
    const response = await shopify.query(query, variables)
    const result: any[] = []
    for (const collection of response.data.data.collections.edges) {
      if (
        !result.find(c => c.id === String(collection.node.legacyResourceId))
      ) {
        result.push({
          id: String(collection.node.legacyResourceId),
          title: collection.node.title
        })
      }
    }
    const {
      collections: {
        pageInfo: { hasNextPage },
        edges
      }
    } = response.data.data
    const cursor = edges[0]?.cursor
    res.json({
      collections: result,
      hasNextPage,
      cursor
    })
  })
)

router.get(
  '/',
  bodyParser.json(),
  asyncHandler(async (req, res) => {
    const store = await getStoreWithAccessToken(req)
    const shopify = Shopify.fromStore(store)
    const query = req.url.split('?')[1]
    const response = await shopify.getCollections(query)
    res.json({
      custom_collections: response.data,
      link: response.headers.link?.replace(shopifyURLPattern, '/collections')
    })
  })
)

router.get(
  '/:id',
  bodyParser.json(),
  asyncHandler(async (req, res) => {
    const store = await getStoreWithAccessToken(req)
    const shopify = Shopify.fromStore(store)
    const response = await shopify.getCollection(req.params.id)
    if (response.data.collection_type === 'smart') {
      return res.status(404).json({ error: 'custom collection not found' })
    }
    res.json(response.data)
  })
)

export default router
