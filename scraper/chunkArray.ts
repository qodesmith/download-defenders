export function chunkArray<T>(arr: T[], size): T[][] {
  return Array.from({length: Math.ceil(arr.length / size)}, (v, i) =>
    arr.slice(i * size, i * size + size)
  )
}
