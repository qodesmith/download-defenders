import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs-extra'
import twoDigitNum from './twoDigitNum.js'
import chalk from 'chalk'

dotenv.config()

const seriesFolder = path.resolve(`./${process.env.MAIN_DOWNLOAD_FOLDER_NAME}`)

const folders = fs
  .readdirSync(seriesFolder, {withFileTypes: true})
  .filter(dirent => dirent.isDirectory())
  .map(dirent => `${seriesFolder}/${dirent.name}`)
const data = folders.reduce(
  (acc, folder) => {
    const nameLength = folder.split('/').pop().length
    if (nameLength > acc.longestName) acc.longestName = nameLength

    const mp3Files = fs
      .readdirSync(folder)
      .filter(file => file.endsWith('.mp3'))
    acc.episodeCounts[folder] = mp3Files.length
    acc.totalEpisodes += mp3Files.length

    return acc
  },
  {totalEpisodes: 0, episodeCounts: {}, longestName: 0}
)
const {episodeCounts, longestName, totalEpisodes} = data

console.log(
  chalk.yellow.bold('Episode Count'),
  chalk.gray('│'),
  chalk.bold('Section')
)
console.log(chalk.gray(`${'─'.repeat(14)}┼${'─'.repeat(longestName + 1)}`))

Object.entries(episodeCounts).forEach(([name, count], i, thisArr) => {
  const num = chalk.yellow(twoDigitNum(count))
  console.log(num, ' '.repeat(10), chalk.gray('│'), name.split('/').pop())
  if (i === thisArr.length - 1) {
    console.log(chalk.gray(`${'─'.repeat(14)}┴${'─'.repeat(longestName + 1)}`))
  } else {
    console.log(chalk.gray(`${'─'.repeat(14)}┼${'─'.repeat(longestName + 1)}`))
  }
})
console.log(chalk.cyan.bold('Total episodes:'), chalk.yellow(totalEpisodes))
