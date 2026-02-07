const fs = require('fs/promises')
const path = require('path')

const dataPath = path.join(__dirname, '..', 'data', 'products.json')

const readProducts = async () => {
  try {
    const content = await fs.readFile(dataPath, 'utf-8')
    const data = JSON.parse(content)
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
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeProducts([])
      return []
    }
    throw error
  }
}

const writeProducts = async (products) => {
  await fs.mkdir(path.dirname(dataPath), { recursive: true })
  await fs.writeFile(dataPath, JSON.stringify(products, null, 2))
}

module.exports = { readProducts, writeProducts }
