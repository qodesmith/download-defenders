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
    mp3Duration: number
    youtubePath: string
  }[]
}[]

const defendersSeason3Data = fs.readFileSync(
  path.resolve('defendersSeason3Data.json'),
  {encoding: 'utf8'}
)

const episodeFilePaths = (
  JSON.parse(defendersSeason3Data) as DefendersData
).reduce((acc, section) => {
  const sectionSlug = section.slug

  section.episodes.forEach(({slug: episodeSlug, mp3Path}) => {
    const route = `/${sectionSlug}/${episodeSlug}.mp3`
    acc[route] = mp3Path
  })

  return acc
}, {} as Record<string, string>)

export function devMiddleware(): Plugin {
  return {
    name: 'defenders-data-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET') return next()

        if (req.url === '/defenders/data') {
          return res.end(defendersSeason3Data)
        }

        const filePath = episodeFilePaths[req.url]
        if (filePath) {
          const {size} = fs.statSync(filePath)
          res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': size,

            /**
             * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Ranges
             * This is needed for the FE to be able fast-fwd content.
             */
            'Accept-Ranges': 'bytes',
          })

          const fileContents = fs.readFileSync(filePath)
          return res.end(fileContents)
        }

        next()
      })
    },
  }
}
