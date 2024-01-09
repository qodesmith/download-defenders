import fs from 'fs-extra'
import {retryableFetch} from './retryableFetch'

type DownloadFileInput = {
  url: string
  filePath: string
}

export function downloadFile<T>({
  url,
  filePath,
}: DownloadFileInput): Promise<T> {
  return retryableFetch(url)
    .then((res: Response) => res.arrayBuffer())
    .then((buffer: ArrayBuffer) => {
      fs.outputFileSync(filePath, buffer)
    })
}
