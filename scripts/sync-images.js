import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const imagesDir = path.join(__dirname, '../client/public/images')
const contentFile = path.join(
  __dirname,
  '../client/src/features/cassie/cassie-content.ts'
)

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

function syncImages() {
  console.log('🔍 Scanning for images in:', imagesDir)

  if (!fs.existsSync(imagesDir)) {
    console.error('❌ Images directory not found!')
    return
  }

  const files = fs.readdirSync(imagesDir)
  const imageFiles = files.filter((file) =>
    imageExtensions.includes(path.extname(file).toLowerCase())
  )

  console.log(`✅ Found ${imageFiles.length} images:`, imageFiles)

  if (!fs.existsSync(contentFile)) {
    console.error('❌ Content file not found:', contentFile)
    return
  }

  let content = fs.readFileSync(contentFile, 'utf8')

  // Regex to find the imageFiles array inside getAllImagesFromFolder
  const regex = /(const imageFiles: string\[\] = \[)([\s\S]*?)(\];)/

  const newList = imageFiles.map((file) => `    "${file}"`).join(',\n')
  const replacement = `$1\n${newList}\n  $3`

  if (regex.test(content)) {
    const updatedContent = content.replace(regex, replacement)
    fs.writeFileSync(contentFile, updatedContent)
    console.log('✨ Updated cassie-content.ts successfully!')
  } else {
    console.error('❌ Could not find imageFiles array in cassie-content.ts')
  }
}

syncImages()
