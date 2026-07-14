export function coursePlaceholderImage(seed: string, width = 480, height = 270) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`
}
