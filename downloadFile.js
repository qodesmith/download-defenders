import http from 'http'
import https from 'https'
import fs from 'fs-extra'

export default async function downloadFile({url, dir, fileName}) {
  if (!url) return

  const fetcher = url.startsWith('http://') ? http : https
  const fullFilePath = `${dir}/${fileName}`

  if (fs.existsSync(fullFilePath)) {
    console.log('File already exists:', fileName)
    return
  }

  return new Promise((resolve, reject) => {
    try {
      const options = {
        headers: {
          ...(url.endsWith('.mp3') ? {'Content-Type': 'audio/mpeg'} : {}),
          ...(url.endsWith('.pdf') ? {'Content-Type': 'application/pdf'} : {}),
        },
      }

      // https://www.geeksforgeeks.org/how-to-download-a-file-using-node-js/
      fetcher.get(url, options, res => {
        // Ensure the target directory exists.
        fs.ensureDirSync(dir)

        // Create the stream and pipe data to the file.
        const fileStream = fs.createWriteStream(fullFilePath)
        res.pipe(fileStream)
        fileStream
          .on('finish', () => {
            fileStream.close()
            console.log('File downloaded:', fileName)
            resolve()
          })
          .on('error', err => {
            console.error('File download failed:', url)
            reject(err)
          })
      })
    } catch (e) {
      console.error('File download failed (https error):', url)
      reject(e)
    }
  })
}
