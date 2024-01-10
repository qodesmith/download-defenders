import {load as cheerioLoad} from 'cheerio'
import {SectionMetadata} from './genSectionsMetadata'
import slugify from 'slugify'

type GenEpisodesInput = {
  sectionsMetadata: SectionMetadata[]
  baseUrl: string
}
export type EpisodeMetadata = {
  title: string
  slug: string
  url: string
}
export type SectionAndEpisodeMetadata = SectionMetadata & {
  episodes: EpisodeMetadata[]
}

export async function genEpisodesMetadata({
  sectionsMetadata,
  baseUrl,
}: GenEpisodesInput): Promise<SectionAndEpisodeMetadata[]> {
  const allEpisodesMetadata: EpisodeMetadata[][] = []

  for (let i = 0; i < sectionsMetadata.length; i++) {
    const section = sectionsMetadata[i]
    const episodesMetadata = (
      await genSectionEpisodesMetadata({
        url: section.url,
        baseUrl,
      })
    ).map((episode, episodeIdx) => {
      const episodeNum = `${episodeIdx + 1}`.padStart(2, '0')
      const slug = slugify(`${episodeNum} ${episode.title}`, {lower: true})

      return {...episode, slug}
    })

    allEpisodesMetadata.push(episodesMetadata)
  }

  return sectionsMetadata.map((section, i) => {
    return {...section, episodes: allEpisodesMetadata[i]}
  })
}

type GenSectionEpisodesInput = {
  url: string
  baseUrl: string
}
async function genSectionEpisodesMetadata({
  url,
  baseUrl,
}: GenSectionEpisodesInput): Promise<Omit<EpisodeMetadata, 'slug'>[]> {
  const response = await fetch(url)
  const html = await response.text()
  const $ = cheerioLoad(html)

  // Capture episode titles on the current page.
  const titles: string[] = []
  $('.questions-listing .que-title-desc-block h2').each((_, el) => {
    // "Section 1 (Part 15): Episode Title" => "Episode Title"
    const text = $(el).text().split(':')[1].trim().replace(/’/g, "'")
    titles.push(text)
  })

  // Capture episode urls on the current page.
  const urls: string[] = []
  $('.questions-listing .single-question-details .qa-button a.btn').each(
    (i, a) => {
      const url = $(a).attr('href')
      if (!url) throw new Error(`Url not found for episode "${titles[i]}"`)

      urls.push(url)
    }
  )

  const metadata = titles.map((title, i) => {
    return {title, url: `${baseUrl}${urls[i]}`}
  })

  const nextPageUrl = $('a.page-next.page-button').attr('href')

  if (nextPageUrl) {
    const nextMetadata = await genSectionEpisodesMetadata({
      url: nextPageUrl,
      baseUrl,
    })
    return metadata.concat(nextMetadata)
  }

  return metadata
}
