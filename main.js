import dotenv from 'dotenv'
import fs from 'fs-extra'
import puppeteer from 'puppeteer'
import genSectionsData from './genSectionsData.js'
import path from 'path'
import genPodcastsData from './genPodcastsData.js'
import downloadPodcastData from './downloadPodcastData.js'

dotenv.config()

// Make sure we have the main directory created.
const seriesFolder = path.resolve(`./${process.env.MAIN_DOWNLOAD_FOLDER_NAME}`)
fs.ensureDirSync(seriesFolder)

console.time('Initial sections data created.')
const browser = await puppeteer.launch()
const page = await browser.newPage()

// Navigate to the "sections" page of the series and collect some data.
const sectionsData = await genSectionsData({page, dir: seriesFolder})
console.timeEnd('Initial sections data created')

// Navigate to each section and grab podcast data.
console.time('Podcast data added to sections data')
await genPodcastsData({page, sectionsData})
console.timeEnd('Podcast data added to sections data')

// For each podcast episode, download the final data.
await downloadPodcastData({page, sectionsData})
process.exit()
