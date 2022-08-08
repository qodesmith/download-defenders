import chalk from 'chalk'
import twoDigitNum from './twoDigitNum.js'

export default async function genPodcastsData({page, sectionsData}) {
  for (let i = 0; i < sectionsData.length; i++) {
    const section = sectionsData[i]

    if (section.shouldSkip) {
      console.log(
        chalk.gray.bold(`Skipping section ${i + 1} of ${sectionsData.length}:`),
        chalk.gray(section.folderName)
      )
      continue
    } else {
      console.log(
        chalk.cyan.bold(`Fetching section ${i + 1} of ${sectionsData.length}:`),
        section.folderName
      )
    }

    await page.goto(section.url)
    let paginationPages = [section.url]
    const pagination = await page.$('.pager-pagination')
    if (pagination !== null) {
      paginationPages = await pagination.$$eval(
        'li:not(.buttons) a',
        async nodes => nodes?.map(node => node.href) ?? []
      )

      if (paginationPages.length === 0) {
        throw new Error(
          `Error in parsing links to pagination section: ${section.url}`
        )
      }
    }

    for (let j = 0; j < paginationPages.length; j++) {
      const sectionUrl = paginationPages[j]

      // We've already navigated to the 1st section page above.
      if (j !== 0) {
        await page.goto(sectionUrl)
      }

      const podcasts = await page.$$('.single-question-details')

      if (podcasts.length === 0) {
        throw new Error(`Couldn't find any podcast links at ${sectionUrl}`)
      }

      for (let k = 0; k < podcasts.length; k++) {
        const count = section.podcasts.length + 1
        const num = twoDigitNum(count)
        const podcast = podcasts[k]
        const name = await podcast.$eval('h2', async node => node?.textContent)
        const url = await podcast.$eval(
          '.qa-button a',
          async node => node?.href
        )

        if (!name || !url) {
          throw new Error(
            `Couldn't find name or url for Defenders podcast at ${sectionUrl}`
          )
        }

        section.podcasts.push({name: `${num} - ${name}`, url})
      }
    }
  }
}
