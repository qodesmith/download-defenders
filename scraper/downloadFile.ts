import fs from 'fs-extra'
import {retryableFetch} from './retryableFetch'

type DownloadFileInput = {
  url: string
  filePath: string
  verbose?: boolean
}

export function downloadFile({
  url,
  filePath,
  verbose,
}: DownloadFileInput): Promise<void> {
  return retryableFetch(url, {verbose})
    .then((res: Response) => res.arrayBuffer())
    .then((buffer: ArrayBuffer) => {
      fs.outputFileSync(filePath, buffer)
    })
}
