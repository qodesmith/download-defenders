import downloadFile from './downloadFile.js'
import downloadYouTube from './downloadYouTube.js'
import filenamify from 'filenamify'
import chalk from 'chalk'
import fs from 'fs-extra'

function namey(fileName, extension) {
  const name = filenamify(fileName)
  return extension ? `${name}.${extension}` : name
}

export default async function downloadPodcastData({page, sectionsData}) {
  for (let i = 0; i < sectionsData.length; i++) {
    const {dir, podcasts, shouldSkip, folderName} = sectionsData[i]

    if (shouldSkip) {
      console.log(
        chalk.gray.bold('Section exists (skipping):'),
        chalk.gray(folderName)
      )
      continue
    } else {
      console.log(
        chalk.cyan.bold(
          `Downloading section ${i + 1} of ${sectionsData.length}:`
        ),
        folderName
      )
    }

    for (let j = 0; j < podcasts.length; j++) {
      const {url, name} = podcasts[j]
      const [mp3FileName, pdfFileName, mp4FileName] = ['mp3', 'pdf', 'mp4'].map(
        extension => {
          return namey(name, extension)
        }
      )
      const hasFileObj = {
        mp3FileName: fs.existsSync(`${dir}/${mp3FileName}`),
        pdfFileName: fs.existsSync(`${dir}/${pdfFileName}`),
        mp4FileName: fs.existsSync(`${dir}/${mp4FileName}`),
      }
      const hasAllFiles = Object.values(hasFileObj).every(val => val)

      // Skip navigating to the page altogether if we already have all 3 files.
      if (hasAllFiles) continue

      await page.goto(url)

      // https://stackoverflow.com/questions/32938213/is-there-a-way-to-erase-the-last-line-of-output
      // Clear each time except the first iteration.
      if (j !== 0) {
        process.stdout.moveCursor(0, -1) // up one line
        process.stdout.clearLine(1) // from cursor to end
      }
      console.log(chalk.cyan(`${j + 1}/${podcasts.length}`), chalk.gray(name))

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

      await Promise.allSettled([
        !hasFileObj[mp3FileName] &&
          downloadFile({dir, fileName: mp3FileName, url: mp3Url}),
        !hasFileObj[pdfFileName] &&
          downloadFile({dir, fileName: pdfFileName, url: pdfUrl}),
        !hasFileObj[mp4FileName] &&
          downloadYouTube({dir, fileName: mp4FileName, url: youTubeUrl}),
      ]).then(([mp3Status, pdfStatus, mp4Status]) => {
        if (mp3Status.status === 'rejected') {
          console.log(chalk.red(`Failed to download file:`, mp3FileName))
        }
        if (pdfStatus.status === 'rejected') {
          console.log(chalk.red(`Failed to download file:`, pdfFileName))
        }
        if (mp4Status.status === 'rejected') {
          console.log(chalk.red(`Failed to download file:`, mp4FileName))
        }
      })
    }
  }
}
