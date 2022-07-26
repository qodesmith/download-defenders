import ytdl from 'ytdl-core'
import fs from 'fs-extra'

export default async function downloadYouTube({url, dir, fileName}) {
  if (!url) return

  const fullFilePath = `${dir}/${fileName}`

  if (fs.existsSync(fullFilePath)) {
    console.log('File already exists:', fileName)
    return
  }

  return new Promise((resolve, reject) => {
    // Ensure the target directory exists.
    fs.ensureDirSync(dir)
    const writableStream = fs.createWriteStream(fullFilePath)

    try {
      ytdl(url, {quality: 'highest'})
        .pipe(writableStream)
        .on('finish', () => {
          writableStream.close()
          console.log('File downloaded:', fileName)
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
