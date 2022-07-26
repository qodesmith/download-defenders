export default async function genPodcastsData({page, sectionsData}) {
  for (let i = 0; i < sectionsData.length; i++) {
    if (i === 3) return // TODO: remove
    const section = sectionsData[i]

    await page.goto(section.url)
    let paginationPages = [section.url]
    const pagination = await page.$('.pager-pagination')
    if (pagination !== null) {
      paginationPages = await pagination.$$eval('li:not(.buttons) a', nodes =>
        nodes.map(node => node.href)
      )
    }

    for (let j = 0; j < paginationPages.length; j++) {
      const sectionUrl = paginationPages[j]
      await page.goto(sectionUrl)
      const podcasts = await page.$$('.single-question-details')

      for (let k = 0; k < podcasts.length; k++) {
        const count = section.podcasts.length + 1
        const num = count.toString().length === 1 ? `0${count}` : count
        const podcast = podcasts[k]
        const name = await podcast.$eval('h2', node => node.textContent)
        const url = await podcast.$eval('.qa-button a', node => node.href)

        section.podcasts.push({name: `${num} - ${name}`, url})
      }
    }
  }
}
