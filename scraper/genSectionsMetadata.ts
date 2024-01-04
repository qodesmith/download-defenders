import {load as cheerioLoad} from 'cheerio'

type GenSectionsInput = {
  seriesUrl: string
}

export async function genSectionsMetadata({seriesUrl}: GenSectionsInput) {
  const response = await fetch(seriesUrl)
  const html = await response.text()
  const $ = cheerioLoad(html)

  // Capture all the section titles.
  const titles: string[] = []
  $('.existance-articles-block h2').each((_, el) => {
    const text = $(el).text()
    titles.push(text)
  })

  // Capture all section urls.
  const urls: string[] = []
  $('.existance-articles-block a').each((i, a) => {
    const url = $(a).attr('href')
    if (!url) throw new Error(`Url not found for section "${titles[i]}"`)

    urls.push(url)
  })

  return titles.map((title, i) => {
    return {title, url: `${seriesUrl}${urls[i]}`}
  })
}
