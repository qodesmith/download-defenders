import downloadFile from './downloadFile.js'
import downloadYouTube from './downloadYouTube.js'
import filenamify from 'filenamify'
import fs from 'fs-extra'

function namey(fileName, extension) {
  const name = filenamify(fileName)
  return `${name}.${extension}`
}

export default async function downloadPodcastData({page, sectionsData}) {
  for (let i = 0; i < sectionsData.length; i++) {
    const {dir, podcasts} = sectionsData[i]

    for (let j = 0; j < podcasts.length; j++) {
      const {url, name} = podcasts[j]
      const [mp3FileName, pdfFileName, mp4FileName] = ['mp3', 'pdf', 'mp4'].map(
        extension => {
          return namey(name, extension)
        }
      )
      const fullyDownloaded = [mp3FileName, pdfFileName, mp4FileName].every(
        fullFilePath => {
          return fs.existsSync(fullFilePath)
        }
      )

      if (fullyDownloaded) continue
      await page.goto(url)

      /*
        There are 3 things we want from each podcast episode page:
          1. mp3 file
          2. Transcript
          3. YouTube video file
        
          If for some reason one of the 3 isn't available, return undefined.
      */
      console.log('----')
      const [mp3Url, pdfUrl, youTubeUrl] = await Promise.all([
        // MP3
        page.$eval('a.download-btn.icon-download', async node => node?.href),

        // Transcript
        page.$eval('a.download-btn.icon-transcript', async node => node?.href),

        // YouTube
        // There are multiple iframes on the page. I suspect this is Chromium.
        page.$$eval('iframe', async iframes => {
          const urls = iframes.map(iframe => iframe.src)
          const src = urls.find(url => url?.startsWith('https://www.youtube'))
          const id = src?.split('/').pop()

          return id ? `https://www.youtube.com/watch?v=${id}` : undefined
        }),
      ])

      console.time('Downloaded data for episode.')
      await Promise.all([
        downloadFile({dir, fileName: mp3FileName, url: mp3Url}),
        downloadFile({dir, fileName: pdfFileName, url: pdfUrl}),
        downloadYouTube({dir, fileName: mp4FileName, url: youTubeUrl}),
      ])
      console.timeEnd('Downloaded data for episode.')
    }
  }
}
