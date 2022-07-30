import ytdl from 'ytdl-core'
import fs from 'fs-extra'

export default async function downloadYouTube({url, dir, fileName}) {
  if (!url) return

  const fullFilePath = `${dir}/${fileName}`

  return new Promise((resolve, reject) => {
    // Ensure the target directory exists.
    fs.ensureDirSync(dir)
    const writableStream = fs.createWriteStream(fullFilePath)

    try {
      // https://bit.ly/3Q5nP78 - example for rotating ipv6 option.
      ytdl(url, {quality: 'highest'})
        .pipe(writableStream)
        .on('finish', () => {
          writableStream.close()
          resolve()
        })
        .on('error', err => {
          console.error('File download failed:', url)
          reject(err)
        })
    } catch (e) {
      console.error('YouTube download failed (ytdl error):', url)
      reject(e)
    }
  })
}
