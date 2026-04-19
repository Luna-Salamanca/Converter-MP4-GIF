export function applyOrderedDither(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  spread = 16
) {
  // 4x4 Bayer matrix for ordered dithering
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const bayerVal = bayer[(y & 3) * 4 + (x & 3)]
      // Centered offset roughly between -spread/2 and +spread/2
      const offset = (bayerVal / 16 - 0.5) * spread

      // Uint8ClampedArray clamps < 0 to 0 and > 255 to 255 automatically
      data[i] = data[i] + offset
      data[i + 1] = data[i + 1] + offset
      data[i + 2] = data[i + 2] + offset
    }
  }
}
