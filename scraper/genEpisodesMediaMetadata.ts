import chalk from 'chalk'
import type {
  EpisodeMetadata,
  SectionAndEpisodeMetadata,
} from './genEpisodesMetadata'
import {load as cheerioLoad} from 'cheerio'
import {SectionMetadata} from './genSectionsMetadata'

type GenMediaMetadataInput = {
  sectionsAndEpisodesMetadata: SectionAndEpisodeMetadata[]
  chunkSize: number
}
type EpisodeWithMediaMetadata = EpisodeMetadata & {
  mp3Url: string
  youtubeUrl: string
}
type FullSectionMetadata = SectionMetadata & {
  episodes: EpisodeWithMediaMetadata[]
}

export async function genEpisodesMediaMetadata({
  sectionsAndEpisodesMetadata,
  chunkSize,
}: GenMediaMetadataInput): Promise<FullSectionMetadata[]> {
  // This array will contain all the functions created to trigger a fetch.
  const episodePromiseFxns: (() => Promise<void>)[] = []

  // Each fetch call will store data in this object when it resolves.
  const episodesObj: Record<string, EpisodeWithMediaMetadata[]> = {}

  /**
   * Create a function that triggers a fetch for each individual episode.
   */
  sectionsAndEpisodesMetadata.forEach(({episodes}, sectionIdx) => {
    episodes.forEach(({url, title}, episodeIdx) => {
      const promiseFxn = async () => {
        return fetch(url)
          .then(res => res.text())
          .then(html => {
            const $ = cheerioLoad(html)
            const mp3Url = $('a.download-btn.icon-download').attr('href')
            const iframeYoutubeUrl = $('iframe').attr('src')
            const youtubeUrl =
              iframeYoutubeUrl?.replace('/embed/', '/watch?v=') ?? ''

            if (!mp3Url) {
              throw new Error(`Unable to find MP3 url for "${title}"`)
            }

            if (!youtubeUrl) {
              console.log(
                chalk.gray(
                  `No YouTube url found [${sectionIdx}|${episodeIdx}] - ${title}`
                )
              )
            }

            const key = `section${sectionIdx}`
            episodesObj[key] ??= []
            episodesObj[key][episodeIdx] = {mp3Url, youtubeUrl, title, url}
          })
      }

      episodePromiseFxns.push(promiseFxn)
    })
  })

  // Group the promises into batches to avoid 429 responses (too many requests).
  const promiseFxnChunks = chunkArray(episodePromiseFxns, chunkSize)
  let currentChunk = 0

  /**
   * Trigger the promises sequentially in batches and wait for all of them to
   * finish.
   */
  await promiseFxnChunks.reduce((accPromise, promiseFxnsArr) => {
    return accPromise.then(() => {
      const promises = promiseFxnsArr.map(fxn => fxn())
      return Promise.all(promises).then(() => {
        console.log(
          chalk.gray(
            `[${++currentChunk} of ${
              promiseFxnChunks.length
            }] promise batches completed`
          )
        )
      })
    })
  }, Promise.resolve())

  /**
   * Now that we have all the data, aggregate it into an object shape we expect
   * and return.
   */
  return sectionsAndEpisodesMetadata.map((section, sectionIdx) => {
    const key = `section${sectionIdx}`
    const episodes = episodesObj[key]

    return {...section, episodes}
  })
}

function chunkArray<T>(arr: T[], size): T[][] {
  return Array.from({length: Math.ceil(arr.length / size)}, (v, i) =>
    arr.slice(i * size, i * size + size)
  )
}
