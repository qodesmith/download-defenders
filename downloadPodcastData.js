import downloadFile from './downloadFile.js'
import downloadYouTube from './downloadYouTube.js'
import filenamify from 'filenamify'

export default async function downloadPodcastData({page, sectionsData}) {
  for (let i = 0; i < sectionsData.length; i++) {
    const {dir, podcasts} = sectionsData[i]

    for (let j = 0; j < podcasts.length; j++) {
      const {url, name} = podcasts[j]
      await page.goto(url)

      /*
        There are 3 things we want from each podcast episode page:
          1. mp3 file
          2. Transcript
          3. YouTube video file
      */
      console.log('----')
      const [mp3Url, pdfUrl, youTubeUrl] = await Promise.all([
        // MP3
        page.$eval('a.download-btn.icon-download', node => node.href),

        // Transcript
        page.$eval('a.download-btn.icon-transcript', node => node.href),

        // YouTube
        // There are multiple iframes on the page. I suspect this is Chromium.
        page.$$eval('iframe', nodes => {
          const urls = nodes.map(node => node.src)
          const src = urls.find(url => url.startsWith('https://www.youtube'))
          const id = src.split('/').pop()

          return `https://www.youtube.com/watch?v=${id}`
        }),
      ])

      console.time('Downloaded data for episode.')
      await Promise.all([
        downloadFile({dir, fileName: namey(name, 'mp3'), url: mp3Url}),
        downloadFile({dir, fileName: namey(name, 'pdf'), url: pdfUrl}),
        downloadYouTube({dir, fileName: namey(name, 'mp4'), url: youTubeUrl}),
      ])
      console.timeEnd('Downloaded data for episode.')
    }
  }
}

function namey(fileName, extension) {
  const name = filenamify(fileName)
  return `${name}.${extension}`
}
