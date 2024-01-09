import chalk from 'chalk'

export function retryableFetch(
  url: string,
  {timeout = 100, maxRetries = 3}: {timeout?: number; maxRetries?: number} = {}
) {
  let tries = 0
  function executeFetch() {
    return fetch(url)
      .then(res => {
        if (res.redirected) {
          return retryableFetch(res.url, {timeout, maxRetries})
        }

        tries++
        if (res.ok || tries > maxRetries) return res

        return new Promise(resolve => {
          setTimeout(resolve, timeout)
        }).then(() => {
          console.log(chalk.gray('  [then] retrying fetch...'))
          return executeFetch()
        })
      })
      .catch(err => {
        tries++
        if (tries > maxRetries) return err

        return new Promise(resolve => {
          setTimeout(resolve, timeout)
        }).then(() => {
          console.log(chalk.gray('  [catch] retrying fetch ...'))
          return executeFetch()
        })
      })
  }

  return executeFetch()
}
