import downloadFile from './downloadFile.js'
import downloadYouTube from './downloadYouTube.js'
import filenamify from 'filenamify'
import chalk from 'chalk'
import fs from 'fs-extra'
import removeAnsiChars from './removeAnsiChars.js'

function namey(fileName, extension) {
  const name = filenamify(fileName)
  return extension ? `${name}.${extension}` : name
}

export default async function downloadPodcastData({page, sectionsData}) {
  const sectionDataLength = sectionsData.length

  // A way to keep track if we've logged progress to the CLI.
  const hasLogged = {value: false}

  for (let i = 0; i < sectionDataLength; i++) {
    const {dir, podcasts, shouldSkip, folderName} = sectionsData[i]
    const podcastsLength = podcasts.length

    // Clear progress logs before starting the next section..
    if (hasLogged.value) {
      hasLogged.value = false
      await clearColorfulLogs()
    }

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

    for (let j = 0; j < podcastsLength; j++) {
      const {url, name} = podcasts[j]

      // Create the names of the files to be downloaded.
      const [mp3FileName, pdfFileName, mp4FileName] = ['mp3', 'pdf', 'mp4'].map(
        extension => namey(name, extension)
      )

      // Check if files exist and have a byte-length.
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

      // After each promise resolves, update the progress by logging in the CLI.
      const promiseCb = i => async () => {
        promiseBools[i] = true
        return logProgress({
          promiseBools,
          current: j + 1,
          total: podcastsLength,
          name,
          hasLogged,
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

      /*
        Check again if we actually need to download files. The check above
        `page.goto` isn't aware of how many files the podcast offers. It's only
        after we've navigated to the page that we know. This check will
        determine if we actually have any files we need to download.
      */
      if (promises.filter(Boolean).length === 0) continue

      /*
        Populate the promiseBools array for subsequent logProgress calls (even
        the calls in promiseCb).
      */
      promises.forEach((item, i) => {
        if (item instanceof Promise) {
          // Indicates an incomplete download in progress.
          promiseBools[i] = false
        } else {
          // Indicates file not available to download.
          promiseBools[i] = null
        }
      })

      // The first CLI log to kick off the visuals.
      await logProgress({
        promiseBools,
        current: j + 1,
        total: podcastsLength,
        name,
        hasLogged,
      })

      await Promise.all(promises).then(() => {
        // Ensure no files are 0 bytes.
        checkSizes({
          dir,
          fileNames: [mp3FileName, pdfFileName, mp4FileName],
          filesExisting: [mp3FileExists, pdfFileExists, mp4FileExists],
        })
      })
    }
  }
}

async function clearColorfulLogs() {
  return new Promise(resolve => {
    // Move the cursor up 2 lines, then clear from there down.
    process.stdout.moveCursor(0, -2, () => {
      process.stdout.clearScreenDown(resolve)
    })
  })
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
async function logProgress({promiseBools, current, total, name, hasLogged}) {
  const openBracket = chalk.cyan.bold('[')
  const closedBracket = chalk.cyan.bold(']')
  const comma = chalk.cyan(',')
  const empty = chalk.cyan('▯')
  const full = chalk.cyan('▮')
  const blocks = `${full.repeat(current)}${empty.repeat(total - current)}`
  const count = chalk.cyan(`${current}/${total}`)
  const fileTypes = ['mp3', 'pdf', 'mp4']
    .map((ext, i) => {
      const value = promiseBools[i]
      if (value === null) return
      return value ? chalk.cyan(ext) : chalk.gray(ext)
    })
    .filter(Boolean)
    .join(comma)
  const extensions = `${openBracket}${fileTypes}${closedBracket}`
  const ellipsis = '…'

  return new Promise(resolve => {
    function logColorfulData() {
      const terminalWidth = process.stdout.columns
      const messageWidth = removeAnsiChars(
        `${count} ${extensions} ${name}`
      ).length
      let nameUsed = name

      if (messageWidth > terminalWidth) {
        const difference = messageWidth - terminalWidth
        nameUsed = `${name.slice(0, -(difference + 1))}${ellipsis}`
      }

      console.log(`${openBracket}${blocks}${closedBracket}`)
      console.log(count, extensions, chalk.gray(nameUsed))
      hasLogged.value = true
    }

    // https://stackoverflow.com/questions/32938213/is-there-a-way-to-erase-the-last-line-of-output
    // Clear each time so long as we previously logged to the CLI.
    if (hasLogged.value) {
      clearColorfulLogs().then(() => {
        logColorfulData()
        resolve()
      })
    } else {
      logColorfulData()
      resolve()
    }
  })
}

function checkSizes({dir, fileNames, filesExisting}) {
  fileNames.forEach((name, i) => {
    if (filesExisting[i]) {
      const fullPath = `${dir}/${name}`
      const fileSize = fs.statSync(fullPath).size

      if (fileSize === 0) {
        throw new Error(`0 byte file size: ${name}`)
      }
    }
  })
}

/*
  When do we want to clear logs?
    * When logging - if we've previously logged, clear those logs.
    * When finishing a new section - if we've previously logged, clear those logs.
*/
