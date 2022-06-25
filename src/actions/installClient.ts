import Shopify, { ShopifyAsset, ShopifyTheme } from '../lib/Shopify'

const script = `<script data-b8-data>
window.B8_CUSTOMER_ID = {{ customer.id | json }};
window.B8_CUSTOMER_TAGS = {{ customer.tags | json }};
</script>`

export default async function installClient(shopify: Shopify) {
  const { data: themes } = await shopify.getThemes()

  for (const theme of themes) {
    const { data: asset } = await shopify.getLayoutAsset(theme.id)
    let value = asset.value, originalValue = asset.value
    const beginIndex = value.indexOf('<script data-b8-data>')
    if (beginIndex >= 0) {
      // tag installed, remove it
      const endIndex = value.indexOf('</script>', beginIndex)
      value =
        value.slice(0, beginIndex) +
        value.slice(endIndex + '</script>'.length)
    }
    // add script tag for customer data
    const endOfBodyIndex = value.indexOf('</body>')
    value = value.slice(0, endOfBodyIndex) + script + value.slice(endOfBodyIndex)
    if (value !== originalValue) {
      shopify.updateLayoutAsset(theme.id, value)
    }
  }

  const scriptTagsResponse = await shopify.getCartScript()
  if (scriptTagsResponse.data.script_tags.length === 0) {
    await shopify.createCartScript()
  }
}
