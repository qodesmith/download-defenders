export default function twoDigitNum(num) {
  if (Number.isNaN(+num)) {
    throw new Error('Expected a number or string representation of a number.')
  }

  const numString = num.toString().trim()
  return numString.length === 1 ? `0${numString}` : numString
}
