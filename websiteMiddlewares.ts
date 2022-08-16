import type {Plugin} from 'vite'

import fs from 'fs-extra'
import path from 'node:path'
import slugify from 'slugify'

export type DefendersDataType = SectionType[]
export type SectionType = {
  sectionName: string // Foundations of Christian Doctrine
  slug: string // foundations-of-christian-doctrine
  episodes: EpisodeType[]
}
export type EpisodeType = {
  title: string // Foundations of Christian Doctrine (Part 1)! Why Study Christian Doctrine
  slug: string // foundations-of-christian-doctrine-part-1-why-study-christian-doctrine
  fileNames: {
    mp3?: string // 01 - Foundations of Christian Doctrine (Part 1)! Why Study Christian Doctrine.mp3
    mp4?: string
    pdf?: string
  }
}

/*
  TODO:
  Can this be more strongly typed?
  Can we infer specific values from DefendersDataType?

  {[fileName]: filePath}
*/
type DefendersDataMap = Record<string, string>

const fileTypes = ['mp3', 'mp4', 'pdf'] as const
const rootPath = path.resolve('./Defenders Series 3')

function createDefendersData(): DefendersDataType {
  return fs
    .readdirSync(rootPath, {withFileTypes: true})
    .reduce((dataArr, dirent) => {
      if (!dirent.isDirectory()) return dataArr

      const sectionName = dirent.name
      const sectionSlug = slugify(sectionName.slice(5), {
        lower: true,
        strict: true,
      })
      const sectionPath = path.resolve(rootPath, sectionName)
      const sectionFiles = fs.readdirSync(sectionPath)
      const episodes: EpisodeType[] = []

      for (let i = 0; i < sectionFiles.length; i++) {
        const fileName = sectionFiles[i]
        const episodeNumber = Number(fileName.slice(0, 2))
        const isEpisodeFile = fileTypes.some(ext =>
          fileName.endsWith(`.${ext}`)
        )

        /*
          Only process files related to the episode (i.e. skip '.DStore', etc.).
          We process each episode's files in batch, just once. Skip otherwise.
        */
        if (!isEpisodeFile || episodes[episodeNumber - 1]) continue

        /*
          Remove the prefixed number and the suffixed file extension:
            * 5 - Each episode starts with 5 characters, such as '01 - '
            * 4 - Each episode ends with 4 characters, such as '.mp4'
        */
        const fileParts = path.parse(fileName)
        const fileWithoutExt = fileParts.name
        const episodeTitle = fileWithoutExt.slice(5) // Remove the number prefix.
        const episode: EpisodeType = {
          title: episodeTitle,
          slug: slugify(episodeTitle, {lower: true, strict: true}),
          fileNames: fileTypes.reduce((acc: EpisodeType['fileNames'], ext) => {
            acc[ext] = `${fileWithoutExt}.${ext}`
            return acc
          }, {}),
        }

        episodes.push(episode)
      }

      dataArr.push({
        sectionName: sectionName.slice(5),
        slug: sectionSlug,
        episodes,
      })
      return dataArr
    }, [] as DefendersDataType)
}

function createDefendersFileMap(): DefendersDataMap {
  return fs
    .readdirSync(rootPath, {withFileTypes: true})
    .reduce((acc: DefendersDataMap, dirent) => {
      if (!dirent.isDirectory()) return acc

      const sectionName = dirent.name
      const sectionPath = path.resolve(rootPath, sectionName)

      fs.readdirSync(sectionPath).forEach(file => {
        const isDesiredFile = fileTypes.some(type => file.endsWith(`.${type}`))
        if (!isDesiredFile) return

        const filePath = path.resolve(sectionPath, file)
        acc[file] = filePath
      })

      return acc
    }, {})
}

export const defendersData = createDefendersData()
export const defendersFileMap = createDefendersFileMap()

const data = JSON.stringify({data: defendersData})
const contentTypes = {
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  pdf: 'application/pdf',
}

// https://vitejs.dev/guide/api-plugin.html#configureserver
export function devMiddleware(): Plugin {
  return {
    name: 'dev-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET') return next()

        if (req.url === '/defenders/data') {
          return res.end(data)
        }

        for (const [fileName, filePath] of Object.entries(defendersFileMap)) {
          const decodedUrl = decodeURI(req.url)
          if (decodedUrl === `/defenders/${fileName}`) {
            const {size} = fs.statSync(filePath)
            res.writeHead(200, {
              'Content-Type': contentTypes[filePath.slice(-3)],
              'Content-Length': size,

              /*
                https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Ranges
                This is needed for the FE to be able fast-fwd content.
              */
              'Accept-Ranges': 'bytes',
            })

            const fileContents = fs.readFileSync(filePath)
            return res.end(fileContents)
          }
        }

        next()
      })
    },
  }
}
