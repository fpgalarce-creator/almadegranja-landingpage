const fs = require('fs/promises')
const path = require('path')

const dataPath = path.join(__dirname, '..', 'data', 'products.json')

const readProducts = async () => {
  const content = await fs.readFile(dataPath, 'utf-8')
  return JSON.parse(content)
}

const writeProducts = async (products) => {
  await fs.writeFile(dataPath, JSON.stringify(products, null, 2))
}

module.exports = { readProducts, writeProducts }
