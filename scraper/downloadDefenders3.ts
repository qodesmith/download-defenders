import type {FullSectionMetadata} from './genEpisodesMediaMetadata'
import dotenv from 'dotenv'
import path from 'node:path'
import fs from 'fs-extra'
import {downloadFile} from './downloadFile'
import chalk from 'chalk'

const rootPath = path.resolve(__dirname, '..')
dotenv.config({path: path.resolve(rootPath, '.env')})

const mainDownloadFolderName = process.env.MAIN_DOWNLOAD_FOLDER_NAME
if (!mainDownloadFolderName) {
  throw new Error('could not find `process.env.MAIN_DOWNLOAD_FOLDER_NAME`')
}

// Make sure we have the main directory created.
const seriesFolder = path.resolve(rootPath, mainDownloadFolderName)
fs.ensureDirSync(seriesFolder)

const sections = fs.readJSONSync(
  path.resolve(rootPath, 'defendersSeason3Data.json')
) as FullSectionMetadata[]

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

// 276 episodes
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
