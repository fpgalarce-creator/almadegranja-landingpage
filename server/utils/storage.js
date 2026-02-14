const fs = require('fs/promises')
const path = require('path')

const dataPath = path.join(__dirname, '..', 'data', 'products.json')
const kvKey = 'products'

const hasKvConfig = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

const normalizeProducts = (data) => {
  if (!Array.isArray(data)) return []
  return data.map((product) => ({
    id: product.id,
    category: product.category,
    title: product.title ?? product.name ?? '',
    description: product.description ?? '',
    price: Number(product.price),
    unit: product.unit ?? '',
    imageUrl: product.imageUrl ?? '',
    isFeatured: product.isFeatured ?? false,
    createdAt: product.createdAt ?? new Date().toISOString()
  }))
}

const readProductsFromFile = async () => {
  try {
    const content = await fs.readFile(dataPath, 'utf-8')
    return normalizeProducts(JSON.parse(content))
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeProductsToFile([])
      return []
    }
    throw error
  }
}

const writeProductsToFile = async (products) => {
  await fs.mkdir(path.dirname(dataPath), { recursive: true })
  await fs.writeFile(dataPath, JSON.stringify(products, null, 2))
}

const getKvClient = () => {
  // Solo intentamos KV cuando están las env vars de Vercel KV.
  if (!hasKvConfig) return null
  const { kv } = require('@vercel/kv')
  return kv
}

const getProducts = async () => {
  const kv = getKvClient()
  if (kv) {
    const data = await kv.get(kvKey)
    return normalizeProducts(data || [])
  }
  return readProductsFromFile()
}

const saveProducts = async (products) => {
  const kv = getKvClient()
  if (kv) {
    await kv.set(kvKey, products)
    return
  }
  await writeProductsToFile(products)
}

// Compatibilidad con imports existentes.
const readProducts = getProducts
const writeProducts = saveProducts

module.exports = { getProducts, saveProducts, readProducts, writeProducts }
