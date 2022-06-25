import cors from 'cors'
import express from 'express'

import defaultErrorHandler from './lib/defaultErrorHandler'
import accessToken from './routes/accessToken'
import auth from './routes/auth'
import cartScript from './routes/cartScript'
import charges from './routes/charges'
import discounts from './routes/client/discounts'
import drafts from './routes/client/drafts'
import productDiscounts from './routes/client/productDiscounts'
import collections from './routes/collections'
import installations from './routes/installations'
import products from './routes/products'
import rules from './routes/rules'
import variants from './routes/variants'
import webhooks from './routes/webhooks'
import clientVariants from './routes/client/variants'

const app = express()

app.use(cors())

app.use('/auth', auth)
app.use('/access_token', accessToken)
app.use('/rules', rules)
app.use('/products', products)
app.use('/variants', variants)
app.use('/collections', collections)
app.use('/installations', installations)
app.use('/cart_script.js', cartScript)
app.use('/webhooks', webhooks)
app.use('/charges', charges)
app.use('/client/drafts', drafts)
app.use('/client/discounts', discounts)
app.use('/client/product_discounts', productDiscounts)
app.use('/client/variants', clientVariants)

// TODO: remove these
app.use('/drafts', drafts)
app.use('/discounts', discounts)
app.use('/product_discounts', productDiscounts)

app.get('/status', async (req, res) => {
  res.json({ status: 'ok' })
})

app.use(defaultErrorHandler)

export default app
