import ytdl from 'ytdl-core'
import fs from 'fs-extra'

export default async function downloadYouTube({url, dir, fileName}) {
  return new Promise((resolve, reject) => {
    // Ensure the target directory exists.
    fs.ensureDirSync(dir)
    const writableStream = fs.createWriteStream(`${dir}/${fileName}`)
    console.log('----')
    console.log('YouTube video url:', url)
    console.log('----')

    try {
      ytdl(url, {quality: 'highest'})
        .pipe(writableStream)
        .on('finish', () => {
          writableStream.close()
          console.log('YouTube downloaded:', fileName)
          resolve()
        })
        .on('error', err => {
          console.error('YouTube download failed:', url)
          reject(err)
        })
    } catch (e) {
      console.error('YouTube download failed (ytdl error):', url)
      reject(e)
    }
  })
}
