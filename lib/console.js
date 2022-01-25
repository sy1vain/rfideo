export function logError(e, autoClear) {
  const message = e.message
    ? e.message.substring(0, e.message.indexOf(': {')) || e.message
    : e

  console.warn('Error:', message)

  if (autoClear) setTimeout(clearConsole, 2000)
}

export function clearConsole() {
  setTimeout(console.clear)
}
