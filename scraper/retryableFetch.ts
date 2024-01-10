import chalk from 'chalk'

type Options = {
  timeout?: number
  maxRetries?: number
  verbose?: boolean
}

export function retryableFetch(
  url: string,
  {timeout = 100, maxRetries = 3, verbose = false}: Options | undefined = {}
): Promise<Response> {
  let tries = 0

  async function executeFetch(): Promise<Response> {
    return fetch(url)
      .then(res => {
        if (res.redirected) {
          return retryableFetch(res.url, {timeout, maxRetries})
        }

        tries++
        const triesExceeded = tries > maxRetries
        if (res.ok || triesExceeded) {
          if (verbose && triesExceeded) {
            console.log(chalk.gray(`  [then] retry attempts exceeded - ${url}`))
          }
          return res
        }

        return new Promise(resolve => {
          setTimeout(resolve, timeout)
        }).then(() => {
          if (verbose) {
            console.log(chalk.gray('  [then] retrying fetch...'))
          }
          return executeFetch()
        })
      })
      .catch(err => {
        tries++
        if (tries > maxRetries) return err

        return new Promise(resolve => {
          setTimeout(resolve, timeout)
        }).then(() => {
          if (verbose) {
            console.log(chalk.gray('  [catch] retrying fetch ...'))
          }
          return executeFetch()
        })
      })
  }

  return executeFetch()
}
