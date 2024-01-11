import type {FullSectionMetadata} from './genEpisodesMediaMetadata'
import dotenv from 'dotenv'
import path from 'node:path'
import fs from 'fs-extra'
import {downloadFile} from './downloadFile'
import chalk from 'chalk'
import {addEpisodeMp3Durations} from './addEpisodeMp3Durations'

const rootPath = path.resolve(__dirname, '..')
const jsonDataPath = path.resolve(rootPath, 'defendersSeason3Data.json')
dotenv.config({path: path.resolve(rootPath, '.env')})

const mainDownloadFolderName = process.env.MAIN_DOWNLOAD_FOLDER_NAME
if (!mainDownloadFolderName) {
  throw new Error('could not find `process.env.MAIN_DOWNLOAD_FOLDER_NAME`')
}

// Make sure we have the main directory created.
const seriesFolder = path.resolve(rootPath, mainDownloadFolderName)
fs.ensureDirSync(seriesFolder)

/**
 * At this point, the only thing the data is missing is mp3 durations. This will
 * be added in a step below where we download the mp3s and read the metadata,
 * storing it back into our json file.
 */
const sections = fs.readJSONSync(jsonDataPath) as FullSectionMetadata[]

type EpisodePromiseObj = {
  promiseFxn: () => Promise<void>
  title: string
  sectionProgress: string
}

const episodePromiseObjs = sections.reduce(
  (promiseObjs, section, sectionIdx) => {
    section.episodes.forEach(episode => {
      const episodePromiseObj: EpisodePromiseObj = {
        promiseFxn: async () => {
          return downloadFile({
            url: episode.mp3Url,
            filePath: episode.mp3Path,
            verbose: true,
          })
        },
        title: episode.title,
        sectionProgress: `[section ${sectionIdx + 1} of ${sections.length}]`,
      }

      promiseObjs.push(episodePromiseObj)
    })

    return promiseObjs
  },
  [] as EpisodePromiseObj[]
)

// Download 276 episodes
await episodePromiseObjs.reduce(
  (promise, {promiseFxn, title, sectionProgress}, i) => {
    return promise.then(() => {
      console.log(
        chalk.gray(
          `[${i + 1} of ${episodePromiseObjs.length}]${sectionProgress}`
        ),
        chalk.gray(title)
      )

      return promiseFxn()
    })
  },
  Promise.resolve()
)

// Add mp3 durations to all episodes.
const completeSectionsMetadata = await addEpisodeMp3Durations(sections)
fs.writeJSONSync(jsonDataPath, completeSectionsMetadata, {spaces: 2})
