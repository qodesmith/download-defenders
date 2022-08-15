export function makeTitle(str: string): string {
  const value = str.split('!').pop()?.slice(1)

  if (!value) throw new Error("Couldn't create title")
  return value
}
