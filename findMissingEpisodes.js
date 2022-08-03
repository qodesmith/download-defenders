/*
  Findings catalogued in a Google sheet at:
  https://docs.google.com/spreadsheets/d/1NCLpk6K6ozirjHFBqVyZP1-JzRuMUPC2aLi0b1W4szo/edit#gid=0
*/

import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs-extra'

dotenv.config()

const extensions = ['mp3', 'mp4', 'pdf']
const extensionToSearch = process.argv.slice(2)[0]

if (
  extensionToSearch !== undefined &&
  !extensions.includes(extensionToSearch)
) {
  throw new Error('Valid extensions are: mp3, mp4, or pdf')
}

const fullEpisodesMissing = {}
const filesMissing = {}
const seriesFolder = path.resolve(process.env.MAIN_DOWNLOAD_FOLDER_NAME)
const sectionFolders = fs
  .readdirSync(seriesFolder, {withFileTypes: true})
  .filter(dirent => dirent.isDirectory())
  .map(dirent => `${seriesFolder}/${dirent.name}`)

sectionFolders.forEach(sectionPath => {
  const set = new Set([])
  const relevantFiles = fs.readdirSync(sectionPath).filter(file => {
    return extensions.includes(file.split('.').pop())
  })
  relevantFiles.forEach(file => {
    const fileWithoutExtension = file.split('.').slice(0, -1).join('.')
    set.add(fileWithoutExtension)
  })

  collectMissingEpisodes({set, sectionPath})
})

console.log('Full Episodes Missing:')
console.log(fullEpisodesMissing)
console.log('-'.repeat(50))
console.log('Files Missing:')
console.log(filesMissing)

function collectMissingEpisodes({set, sectionPath}) {
  const filesInFolderSet = new Set(fs.readdirSync(sectionPath))
  const seriesFolder = path.basename(sectionPath)
  const episodes = Array.from(set)
  const numberSet = new Set([])

  episodes.forEach(episode => {
    // '01 - Doctrine of Revelation...' => 1
    const num = Number(episode.slice(0, 2))
    numberSet.add(num)

    /*
      Track if the full espisode (all 3 files) is missing altogether by:
        * We check the episode prior to the one we're on. It should be 1 less.
        * The 1st episode is skipped for obvious reasons.
    */
    if (num !== 1 && !numberSet.has(num - 1)) {
      if (!fullEpisodesMissing[seriesFolder]) {
        fullEpisodesMissing[seriesFolder] = []
      }
      fullEpisodesMissing[seriesFolder].push(num - 1)
    }

    extensions.forEach(extension => {
      /*
        If a specific extension was provided via the CLI command,
        only process that extension.
      */
      if (extensionToSearch !== undefined && extension !== extensionToSearch) {
        return
      }

      const expectedFileName = `${episode}.${extension}`

      if (!filesInFolderSet.has(expectedFileName)) {
        if (!filesMissing[seriesFolder]) {
          filesMissing[seriesFolder] = {}
        }
        if (!filesMissing[seriesFolder][extension]) {
          filesMissing[seriesFolder][extension] = []
        }
        filesMissing[seriesFolder][extension].push(expectedFileName)
      }
    })
  })
}
