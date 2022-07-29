import http from 'http'
import https from 'https'
import fs from 'fs-extra'

export default async function downloadFile({url, dir, fileName}) {
  const fetcher = url.startsWith('https') ? https : http
  const fullFilePath = `${dir}/${fileName}`

  return new Promise((resolve, reject) => {
    try {
      // https://www.geeksforgeeks.org/how-to-download-a-file-using-node-js/
      // https://futurestud.io/tutorials/node-js-how-to-download-a-file
      fetcher.get(url, res => {
        const code = res.statusCode ?? 0
        if (code >= 400) return reject(new Error(res.statusMessage))

        // Handle redirects.
        if (code > 300 && code < 400 && !!res.headers.location) {
          return resolve(
            downloadFile({url: res.headers.location, dir, fileName})
          )
        }

        // Ensure the target directory exists.
        fs.ensureDirSync(dir)

        // Create the stream and pipe data to the file.
        const fileStream = fs.createWriteStream(fullFilePath)
        res.pipe(fileStream)
        fileStream
          .on('finish', () => {
            fileStream.close()
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
