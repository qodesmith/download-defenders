import dotenv from 'dotenv'
import fs from 'fs-extra'
import puppeteer from 'puppeteer'
import genSectionsData from './genSectionsData.js'
import path from 'path'
import genPodcastsData from './genPodcastsData.js'
import downloadPodcastData from './downloadPodcastData.js'
import chalk from 'chalk'

dotenv.config()

// Make sure we have the main directory created.
const seriesFolder = path.resolve(`./${process.env.MAIN_DOWNLOAD_FOLDER_NAME}`)
fs.ensureDirSync(seriesFolder)

console.log(
  chalk.yellow.bold('PHASE 1:'),
  chalk.yellow('fetching sections data...')
)
console.time(chalk.green.bold('Sections data complete'))
const browser = await puppeteer.launch()
const page = await browser.newPage()

// Navigate to the "sections" page of the series and collect some data.
const sectionsData = await genSectionsData({page, dir: seriesFolder})
console.timeEnd(chalk.green.bold('Sections data complete'))
console.log('--------------------')

// Navigate to each section and grab podcast data.
console.log(
  chalk.yellow.bold('PHASE 2:'),
  chalk.yellow('fetching podcast data for each section...')
)
console.time(chalk.green.bold('Podcast data complete'))
await genPodcastsData({page, sectionsData})
console.timeEnd(chalk.green.bold('Podcast data complete'))
console.log('--------------------')

// For each podcast episode, download the final data.
console.log(
  chalk.yellow.bold('PHASE 3:'),
  chalk.yellow('downloading all data...')
)
console.time(chalk.green.bold('Download complete'))
await downloadPodcastData({page, sectionsData})
console.timeEnd(chalk.green.bold('Download complete'))
process.exit()
