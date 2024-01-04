import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import {genSectionsMetadata} from './genSectionsMetadata'

dotenv.config({path: path.resolve(__dirname, '../.env')})

const seriesUrl = process.env.SERIES_3_URL
if (!seriesUrl) {
  throw new Error('Could not find `process.env.seriesUrl`')
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

const sectionsMetdata = await genSectionsMetadata({seriesUrl})
