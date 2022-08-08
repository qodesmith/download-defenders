import fs from 'fs-extra'
import twoDigitNum from './twoDigitNum.js'

export default async function genSectionsData({page, dir}) {
  await page.goto(process.env.SERIES_3_URL)
  const articles = await page.$$('article')
  const sectionsData = []
  const currentFoldersSet = new Set(fs.readdirSync(dir))

  for (let i = 0; i < articles.length; i++) {
    const count = i + 1
    const nextCount = count + 1
    const article = articles[i]
    const name = await article.$eval('h2', async node => node?.textContent)
    const url = await article.$eval('a', async node => node?.href)
    const nextNum = twoDigitNum(nextCount)
    const folderName = `${twoDigitNum(count)} - ${name}`
    const folderPath = `${dir}/${folderName}`
    const folderExists = currentFoldersSet.has(folderName)
    const has0ByteFiles =
      folderExists &&
      fs.readdirSync(folderPath).some(name => {
        const stats = fs.statSync(`${folderPath}/${name}`)
        return stats.isFile() ? stats.size === 0 : false
      })
    const shouldSkip =
      !has0ByteFiles &&
      [...currentFoldersSet].some(folder => folder.startsWith(nextNum))

    if (!name || !url) {
      throw new Error(`Couldn't find name or url for Defenders section`)
    }

    sectionsData.push({
      dir: folderPath,
      url,
      podcasts: [],
      shouldSkip,
      folderName,
    })
  }

  return sectionsData
}
