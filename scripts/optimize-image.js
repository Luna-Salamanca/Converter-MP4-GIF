import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const INPUT_DIR = './client/public/images'
const OUTPUT_DIR = './client/public/images-optimized'
const MAX_WIDTH = 1200 // Max width in pixels
const QUALITY = 85 // JPEG quality (0-100)

async function optimizeImage(inputPath, outputPath) {
  try {
    const image = sharp(inputPath)
    const metadata = await image.metadata()

    console.log(`Optimizing: ${path.basename(inputPath)}`)
    console.log(
      `  Original: ${metadata.width}x${metadata.height}, ${(metadata.size / 1024).toFixed(2)} KB`
    )

    // Resize if too large
    let pipeline = image
    if (metadata.width > MAX_WIDTH) {
      pipeline = pipeline.resize(MAX_WIDTH, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
    }

    // Convert to JPEG with optimization
    await pipeline
      .jpeg({
        quality: QUALITY,
        progressive: true,
        mozjpeg: true,
      })
      .toFile(outputPath)

    const outputStats = fs.statSync(outputPath)
    const compressionRatio = (
      (1 - outputStats.size / metadata.size) *
      100
    ).toFixed(2)
    console.log(`  Optimized: ${(outputStats.size / 1024).toFixed(2)} KB (${compressionRatio}% smaller)
`)

    return {
      input: path.basename(inputPath),
      inputSize: metadata.size,
      outputSize: outputStats.size,
      saved: metadata.size - outputStats.size,
    }
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error.message)
    return null
  }
}

async function optimizeAllImages() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Get all image files
  const files = fs
    .readdirSync(INPUT_DIR)
    .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))

  console.log(`Found ${files.length} images to optimize
`)

  const results = []
  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file)
    const outputPath = path.join(OUTPUT_DIR, file.replace(/\.\w+$/, '.jpg'))
    const result = await optimizeImage(inputPath, outputPath)
    if (result) results.push(result)
  }

  // Print summary
  const totalSaved = results.reduce((sum, r) => sum + r.saved, 0)
  const totalOriginal = results.reduce((sum, r) => sum + r.inputSize, 0)
  const avgCompression = ((totalSaved / totalOriginal) * 100).toFixed(2)

  console.log(`
=== OPTIMIZATION COMPLETE ===`)
  console.log(`Total space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Average compression: ${avgCompression}%`)
  console.log(`Optimized images saved to: ${OUTPUT_DIR}`)
}

optimizeAllImages().catch(console.error)
