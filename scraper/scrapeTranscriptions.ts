import fs from 'fs-extra'
import path from 'node:path'
import {load as cheerioLoad} from 'cheerio'
import type {FullSectionMetadata} from './genEpisodesMediaMetadata'
import chalk from 'chalk'

type TranscribedData = {
  section: string
  episodes: {
    transcriptionHtml: string
    episodeTitle: string
    episodeUrl: string
  }[]
}

const defenders3Data = fs.readJSONSync(
  path.resolve(__dirname, '../defendersSeason3Data.json')
) as FullSectionMetadata[]

console.log(chalk.yellow.bold('Phase 1: aggregating promise functions'))
const promiseFxnsStart = Date.now()
const transcriptionData: TranscribedData[] = []

const promiseFxns = defenders3Data.reduce((acc, section, sectionIdx) => {
  const data: TranscribedData = {
    section: section.title,
    episodes: [],
  }

  section.episodes.forEach((episode, episodeIdx) => {
    const promiseFxn = async () => {
      if (episodeIdx === 0) {
        console.log(
          chalk.gray.bold(
            `[${sectionIdx + 1} of ${defenders3Data.length}] Section: ${
              section.title
            }`
          )
        )
      }

      console.log(
        chalk.gray(
          `  [${episodeIdx + 1} of ${section.episodes.length}] ${episode.title}`
        )
      )

      return fetch(episode.url)
        .then(res => res.text())
        .then(html => {
          const $ = cheerioLoad(html)
          const transcriptionHtml = $('.tooltip-details-block').html()

          if (!transcriptionHtml) {
            throw new Error(
              `Transciption not found for section ${sectionIdx} episode ${episodeIdx} - ${episode.title}`
            )
          }

          data.episodes.push({
            transcriptionHtml,
            episodeTitle: episode.title,
            episodeUrl: episode.url,
          })
        })
    }

    acc.push(promiseFxn)
  })

  transcriptionData.push(data)

  return acc
}, [] as (() => Promise<void>)[])
console.log(chalk.gray(`[${Date.now() - promiseFxnsStart}ms] complete`))

console.log(chalk.yellow.bold('Phase 2: downloading transcriptions'))
const transcriptionsStart = Date.now()

await promiseFxns.reduce((promise, promiseFxn) => {
  return promise.then(promiseFxn)
}, Promise.resolve())
console.log(chalk.gray(`[${Date.now() - transcriptionsStart}ms] complete`))

fs.writeJSONSync(
  path.resolve(__dirname, '../defenders3TranscriptionData.json'),
  transcriptionData,
  {spaces: 2}
)
