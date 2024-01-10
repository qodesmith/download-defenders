import type {Plugin} from 'vite'

import fs from 'fs-extra'
import path from 'node:path'

export type DefendersData = {
  title: string
  slug: string
  url: string
  folderName: string
  episodes: {
    mp3Url: string
    youtubeUrl: string
    title: string
    slug: string
    url: string
    mp3Path: string
    youtubePath: string
  }[]
}[]

const defendersSeason3Data = fs.readFileSync(
  path.resolve('defendersSeason3Data.json'),
  {encoding: 'utf8'}
)

export function devMiddleware(): Plugin {
  return {
    name: 'defenders-data-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET') return next()

        if (req.url === '/defenders/data') {
          return res.end(defendersSeason3Data)
        }

        next()
      })
    },
  }
}
