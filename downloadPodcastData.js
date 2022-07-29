import downloadFile from './downloadFile.js'
import downloadYouTube from './downloadYouTube.js'
import filenamify from 'filenamify'
import chalk from 'chalk'
import fs from 'fs-extra'
import {resourceLimits} from 'worker_threads'

function namey(fileName, extension) {
  const name = filenamify(fileName)
  return extension ? `${name}.${extension}` : name
}

export default async function downloadPodcastData({page, sectionsData}) {
  const sectionDataLength = sectionsData.length

  for (let i = 0; i < sectionDataLength; i++) {
    const {dir, podcasts, shouldSkip, folderName} = sectionsData[i]

    if (shouldSkip) {
      console.log(
        chalk.gray.bold(`Skipping section ${i + 1} of ${sectionDataLength}:`),
        chalk.gray(folderName)
      )
      continue
    } else {
      console.log(
        chalk.cyan.bold(
          `Downloading section ${i + 1} of ${sectionDataLength}:`
        ),
        folderName
      )
    }

    for (let j = 0; j < podcasts.length; j++) {
      const {url, name} = podcasts[j]

      // We'll look to download 3 files for each podcast. Create those names.
      const [mp3FileName, pdfFileName, mp4FileName] = ['mp3', 'pdf', 'mp4'].map(
        extension => namey(name, extension)
      )

      // If the file exists AND it has a size we'll want to skip downloading it.
      const [mp3FileExists, pdfFileExists, mp4FileExists] = [
        mp3FileName,
        pdfFileName,
        mp4FileName,
      ].map(fileName => {
        const fullPath = `${dir}/${fileName}`
        return fs.existsSync(fullPath) && fs.statSync(fullPath).size
      })

      // Skip navigating to the page altogether if we already have all 3 files.
      if (mp3FileExists && pdfFileExists && mp4FileExists) continue

      await page.goto(url)

      /*
        There are 3 things we want from each podcast episode page:
          1. mp3 file
          2. Transcript
          3. YouTube video file
        
          If for some reason one of the 3 isn't available, return undefined.
      */
      const [mp3Url, pdfUrl, youTubeUrl] = await Promise.all([
        /*
          $$eval > $eval

          The issue with $eval (singular $) is that it throws an error if the
          element isn't found. I tried abstracting it away in a helper function
          with a try/catch, but the error seems to be thrown on the Chromium
          window that is open, not here in this Node process. Basically, the
          try/catch wasn't preventing the Node process from stopping.

          I tried using page.evaluate, but it wouldn't let me pass in a function
          as one of the arguments to the callback. I was tired of fighting with
          Pupeteer, so $$eval for the win.
        */

        // MP3
        page.$$eval('a.download-btn.icon-download', async nodes => {
          return nodes[0]?.href
        }),

        // Transcript
        page.$$eval('a.download-btn.icon-transcript', async nodes => {
          return nodes[0]?.href
        }),

        // YouTube
        // There are multiple iframes on the page. I suspect this is Chromium.
        page.$$eval('iframe', async iframes => {
          const urls = iframes.map(iframe => iframe.src)
          const src = urls.find(url => url?.startsWith('https://www.youtube'))
          const id = src?.split('/').pop()

          return id ? `https://www.youtube.com/watch?v=${id}` : undefined
        }),
      ])

      const promiseBools = []
      const promiseCb = i => () => {
        promiseBools[i] = true
        logProgress({
          promiseBools,
          current: j + 1,
          total: podcasts.length,
          name,
        })
      }
      const promises = [
        !mp3FileExists &&
          mp3Url &&
          downloadFile({dir, fileName: mp3FileName, url: mp3Url}).then(
            promiseCb(0)
          ),
        !pdfFileExists &&
          pdfUrl &&
          downloadFile({dir, fileName: pdfFileName, url: pdfUrl}).then(
            promiseCb(1)
          ),
        !mp4FileExists &&
          youTubeUrl &&
          downloadYouTube({dir, fileName: mp4FileName, url: youTubeUrl}).then(
            promiseCb(2)
          ),
      ]

      // Massage the promiseBools array for the 1st logging attempt below.
      promises.forEach((item, i) => {
        if (item instanceof Promise) {
          // Indicates an incomplete download in progress.
          promiseBools[i] = false
        } else {
          // Indicates file not available to download.
          promiseBools[i] = null
        }
      })

      logProgress({promiseBools, current: j + 1, total: podcasts.length, name})

      await Promise.all(promises).then(() =>
        checkSizes({dir, fileNames: [mp3FileName, pdfFileName, mp4FileName]})
      )
    }
  }
}

/*
  Data needed:
    * Each promise "complete"
      * null - no promise (no file to download)
      * true - promise to download file
    * Current iteration
    * Total iterations
    * Podcast name
*/
function logProgress({promiseBools, current, total, name}) {
  const openBracket = chalk.cyan.bold('[')
  const closedBracket = chalk.cyan.bold(']')
  const comma = chalk.cyan(',')
  const empty = chalk.cyan('▯')
  const full = chalk.cyan('▮')
  const blocks = `${full.repeat(current)}${empty.repeat(total - current)}`
  const fileTypes = ['mp3', 'pdf', 'mp4']
    .map((ext, i) => {
      const value = promiseBools[i]
      if (value === null) return
      return value ? chalk.cyan(ext) : chalk.gray(ext)
    })
    .filter(Boolean)
    .join(comma)

  // https://stackoverflow.com/questions/32938213/is-there-a-way-to-erase-the-last-line-of-output
  // Clear each time except the first iteration.
  if (current !== 1) {
    process.stdout.moveCursor(0, -2) // Up 2 lines
    process.stdout.clearScreenDown()
  }

  console.log(`${openBracket}${blocks}${closedBracket}`)
  console.log(
    chalk.cyan(`${current}/${total}`),
    `${openBracket}${fileTypes}${closedBracket}`,
    chalk.gray(name)
  )
}

function checkSizes({dir, fileNames}) {
  fileNames.forEach(name => {
    const fullPath = `${dir}/${name}`
    const fileSize = fs.statSync(fullPath).size

    if (fileSize === 0) {
      throw new Error(`0 byte file size: ${name}`)
    }
  })
}
