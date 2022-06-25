import Shopify, { ShopifyWebhook } from '../lib/Shopify'

export default async function installWebhooks(shopify: Shopify) {
  const response = await shopify.getWebhooks()
  const webhooks = response.data.webhooks as ShopifyWebhook[]

  async function upsertWebhook(path: string, topic: string) {
    const address = `${process.env.PROMO_API_HOST}${path}`
    const foundWebhook = webhooks.find(
      webhook => webhook.address === address && webhook.topic === topic
    )
    if (!foundWebhook) {
      await shopify.createWebhook({ webhook: { address, topic } })
    }
  }
  await upsertWebhook('/webhooks/products', 'products/create')
  await upsertWebhook('/webhooks/products', 'products/update')
  await upsertWebhook('/webhooks/products', 'products/delete')
  await upsertWebhook('/webhooks/collections', 'collections/create')
  await upsertWebhook('/webhooks/collections', 'collections/update')
  await upsertWebhook('/webhooks/collections', 'collections/delete')
  await upsertWebhook('/webhooks/uninstall', 'app/uninstalled')
}
