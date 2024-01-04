import {load as cheerioLoad} from 'cheerio'

type GenSectionsInput = {
  seriesUrl: string
}

export async function genSectionsData({seriesUrl}: GenSectionsInput) {
  const response = await fetch(seriesUrl)
  const html = await response.text()
  const $ = cheerioLoad(html)
}
