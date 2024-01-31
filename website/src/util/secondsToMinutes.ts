export function secondsToMinutes(seconds: number): string {
  var minutes = Math.floor(seconds / 60)
  var remainingSeconds = seconds % 60

  return minutes + ':' + (remainingSeconds < 10 ? '0' : '') + remainingSeconds
}
