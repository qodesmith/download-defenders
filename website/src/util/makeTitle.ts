export function makeTitle(str: string): string {
  const index = str.indexOf('! ')
  if (index === -1) return str

  const value = str.slice(index + 2).trim()
  if (!value) throw new Error("Couldn't create title")

  return value
}
