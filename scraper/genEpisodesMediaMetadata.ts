import chalk from 'chalk'
import type {
  EpisodeMetadata,
  SectionAndEpisodeMetadata,
} from './genEpisodesMetadata'
import {load as cheerioLoad} from 'cheerio'
import {SectionMetadata} from './genSectionsMetadata'
import {retryableFetch} from './retryableFetch'
import {chunkArray} from './chunkArray'

type GenMediaMetadataInput = {
  sectionsAndEpisodesMetadata: SectionAndEpisodeMetadata[]
  chunkSize: number
  seriesFolder: string
}
type EpisodeWithMediaMetadata = EpisodeMetadata & {
  mp3Url: string
  youtubeUrl: string
  mp3Path: string
  youtubePath: string
}
export type FullSectionMetadata = SectionMetadata & {
  folderName: string // 01 - Foundations of Christian Doctrine
  episodes: EpisodeWithMediaMetadata[]
}

export async function genEpisodesMediaMetadata({
  sectionsAndEpisodesMetadata,
  chunkSize,
  seriesFolder,
}: GenMediaMetadataInput): Promise<FullSectionMetadata[]> {
  // This array will contain all the functions created to trigger a fetch.
  const episodePromiseFxns: (() => Promise<void>)[] = []

  // Each fetch call will store data in this object when it resolves.
  const episodesObj: Record<
    string,
    Omit<EpisodeWithMediaMetadata, 'mp3Path' | 'youtubePath'>[]
  > = {}

  /**
   * Create a function that triggers a fetch for each individual episode.
   */
  sectionsAndEpisodesMetadata.forEach(
    ({episodes, title: sectionTitle}, sectionIdx) => {
      episodes.forEach(({url, title, slug}, episodeIdx) => {
        const promiseFxn = async () => {
          return retryableFetch(url)
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
                    `No YouTube url found [${sectionIdx + 1}|${
                      episodeIdx + 1
                    }] - ${title}`
                  )
                )
                console.log(chalk.gray(`    => ${url}`))
              }

              const key = `section${sectionIdx}`
              episodesObj[key] ??= []
              episodesObj[key][episodeIdx] = {
                mp3Url,
                youtubeUrl,
                title,
                slug,
                url,
              }
            })
        }

        episodePromiseFxns.push(promiseFxn)
      })
    }
  )

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
    const folderPrefix = `${sectionIdx + 1}`.padStart(2, '0')
    const sectionFolderName = `${folderPrefix} - ${section.title}`

    return {
      ...section,
      folderName: sectionFolderName,
      episodes: episodes.map((episode, episodeIdx) => {
        const [mp3FileName, ytFileName] = ['mp3', episode.youtubeUrl && 'mp4']
          .filter(Boolean)
          .map(fileExt => {
            return getEpisodeFileName({
              title: episode.title,
              episodeIdx,
              fileExt,
            })
          })

        return {
          ...episode,
          mp3Path: `${seriesFolder}/${sectionFolderName}/${mp3FileName}`,
          youtubePath: ytFileName
            ? `${seriesFolder}/${sectionFolderName}/${ytFileName}`
            : '',
        }
      }),
    }
  })
}

function getEpisodeFileName({
  title,
  episodeIdx,
  fileExt,
}: {
  title: string
  episodeIdx: number
  fileExt: string
}) {
  const episodePrefix = `${episodeIdx + 1}`.padStart(2, '0')
  const episodeFileName = title
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/ /g, '-')
    .toLowerCase()

  return `${episodePrefix} ${episodeFileName}.${fileExt}`
}
