import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import {genSectionsMetadata} from './genSectionsMetadata'
import {genEpisodesMetadata} from './genEpisodesMetadata'
import {genEpisodesMediaMetadata} from './genEpisodesMediaMetadata'

dotenv.config({path: path.resolve(__dirname, '../.env')})

const baseUrl = process.env.BASE_URL
if (!baseUrl) {
  throw new Error('Could not find `process.env.BASE_URL`')
}

const seriesUrl = process.env.SERIES_3_URL
if (!seriesUrl) {
  throw new Error('Could not find `process.env.SERIES_3_URL`')
}

// Make sure we have the main directory created.
const seriesFolder = path.resolve(
  __dirname,
  `../${process.env.MAIN_DOWNLOAD_FOLDER_NAME}-TEMP`
)
fs.ensureDirSync(seriesFolder)

console.log(
  chalk.yellow.bold('PHASE 1:'),
  chalk.yellow('fetching sections data...')
)
const startSections = Date.now()
const sectionsMetadata = await genSectionsMetadata({seriesUrl, baseUrl})
console.log(
  chalk.gray.bold(`[${Date.now() - startSections}ms]`),
  chalk.gray('- complete')
)

console.log(
  chalk.yellow.bold('PHASE 2:'),
  chalk.yellow('fetching episodes data...')
)
const startEpisodes = Date.now()
const sectionsAndEpisodesMetadata = await genEpisodesMetadata({
  sectionsMetadata,
  baseUrl,
})
console.log(
  chalk.gray.bold(`[${Date.now() - startEpisodes}ms]`),
  chalk.gray('- complete')
)

console.log(
  chalk.yellow.bold('PHASE 3:'),
  chalk.yellow('fetching episodes media data...')
)
const startMediaMetadata = Date.now()
const completeMetadata = await genEpisodesMediaMetadata({
  sectionsAndEpisodesMetadata,
  chunkSize: 20,
})
console.log(
  chalk.gray.bold(`[${Date.now() - startMediaMetadata}ms]`),
  chalk.gray('- complete')
)

fs.writeJSONSync('./test.json', completeMetadata)
