import type {FullSectionMetadata} from './genEpisodesMediaMetadata'
import dotenv from 'dotenv'
import path from 'node:path'
import fs from 'fs-extra'
import {downloadFile} from './downloadFile'
import chalk from 'chalk'
import {chunkArray} from './chunkArray'

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

// Create all episode promise functions to download mp3's (ignore YouTube).
const allEpisodePromiseBatchFxns: (() => Promise<void>)[] = []
sections.forEach(section => {
  // Create the section folder.
  const sectionFolder = `${seriesFolder}/${section.folderName}`
  fs.ensureDirSync(sectionFolder)

  const episodeChunks = chunkArray(section.episodes, 5)
  episodeChunks.forEach((episodes, i) => {
    const chunkPromiseFxn = async () => {
      console.log(
        chalk.gray(`[${i + 1} of ${episodeChunks.length}]`),
        chalk.gray(`Downloading ${section.title} (${episodes.length} episodes)`)
      )

      const episodePromises = episodes.map(
        ({mp3Url, mp3Path, youtubeUrl, youtubePath, title}) => {
          return downloadFile<void>({url: mp3Url, filePath: mp3Path})
        }
      )

      await Promise.all(episodePromises)
      return
    }

    allEpisodePromiseBatchFxns.push(chunkPromiseFxn)
  })
})

// 276 episodes
await allEpisodePromiseBatchFxns.reduce((promise, batchFxn, i) => {
  return promise.then(() => {
    return batchFxn()
  })
}, Promise.resolve())
