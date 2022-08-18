export function makeTitle(str: string): string {
  const index = str.indexOf('!')
  if (index === -1) return str

  const value = str
    .slice(index + 1)
    .trim()
    .replaceAll('!', '/')
  if (!value) throw new Error("Couldn't create title")

  return value
}
