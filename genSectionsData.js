export default async function genSectionsData({page, dir}) {
  await page.goto(process.env.SERIES_3_URL)
  const articles = await page.$$('article')
  const sectionsData = []

  for (let i = 0; i < articles.length; i++) {
    const count = i + 1
    const article = articles[i]
    const name = await article.$eval('h2', async node => node?.textContent)
    const url = await article.$eval('a', async node => node?.href)
    const num = count.toString().length === 1 ? `0${count}` : count

    if (!name || !url) {
      throw new Error(`Couldn't find name or url for Defenders section`)
    }

    sectionsData.push({dir: `${dir}/${num} - ${name}`, url, podcasts: []})
  }

  return sectionsData
}
