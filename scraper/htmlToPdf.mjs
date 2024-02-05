import puppeteer from 'puppeteer'
import path from 'node:path'
import fs from 'fs-extra'
import chalk from 'chalk'
import PDFMerger from 'pdf-merger-js'
// import {TranscribedData} from './scrapeTranscriptions'

const transcriptionData = fs.readJSONSync(
  path.resolve('./defenders3TranscriptionData.json')
) /*as TranscribedData[]*/

let index = 0
function getFileName(num) {
  return `${(num !== undefined ? num : index++)
    .toString()
    .padStart(3, '0')}.pdf`
}

const browser = await puppeteer.launch()
const page = await browser.newPage()

async function makePdf(sectionStartIdx, numOfSections, fileName, title) {
  const promiseFxns = []
  transcriptionData
    .slice(sectionStartIdx, sectionStartIdx + numOfSections)
    .forEach((section, sectionIdx) => {
      const sectionPromiseFxn = async () => {
        console.log(
          chalk.gray.bold(
            `[section ${sectionIdx + 1 + sectionStartIdx} of ${
              transcriptionData.length
            }] - ${section.section}`
          )
        )

        // Set the section title as a page.
        await page.setContent(
          `<h1 style="text-align: center; font-family: sans-serif; margin-top: 200px">${
            section.section
          }</h1>
        <div style="text-align: center; font-family: sans-serif;">Section ${
          sectionIdx + 1 + sectionStartIdx
        }</div>`
        )

        // Write the section title as a file.
        await page.pdf({
          path: getFileName(),
          width: '6in',
          height: '9in',
          margin: {top: 35, right: 35, bottom: 50, left: 35},
        })
      }

      promiseFxns.push(sectionPromiseFxn)

      section.episodes.forEach((episode, episodeIdx) => {
        const episodePromiseFxn = async () => {
          console.log(
            chalk.gray(
              `  [${episodeIdx + 1} of ${section.episodes.length}] - ${
                episode.episodeTitle
              }`
            )
          )

          // Set the episde transcription as a page.
          await page.setContent(`
            <div style="font-family: sans-serif">
              <h2 style="text-align: center">${episode.episodeTitle}</h2>
              <div style="font-size: 12px">${episode.transcriptionHtml}</div>
            </div>
          `)

          // Write the episode title as a file.
          await page.pdf({
            path: getFileName(),
            width: '6in',
            height: '9in',
            margin: {top: 45, right: 35, bottom: 50, left: 35},
            displayHeaderFooter: true,
            headerTemplate: `<div style="width: 100%; text-align: center; font-family: sans-serif; font-size: 10px;">Section ${
              sectionIdx + 1 + sectionStartIdx
            } - ${section.section} (episode ${episodeIdx + 1} of ${
              section.episodes.length
            })</div>`,
            footerTemplate: '<div></div>',
            // '<div style="width: 100%; text-align: center; color: #000; font-size: 10px;"><span class="pageNumber"></span></div>',
          })
        }

        promiseFxns.push(episodePromiseFxn)
      })
    })

  await promiseFxns.reduce((promise, promiseFxn) => {
    return promise.then(promiseFxn)
  }, Promise.resolve())

  const merger = new PDFMerger()

  for (let i = 0; i < index; i++) {
    const tempFileName = getFileName(i)
    await merger.add(tempFileName)
    fs.removeSync(tempFileName)
  }

  await merger.setMetadata({
    producer: 'https://github.com/qodesmith/download-defenders',
    author: 'William Lane Craig',
    creator: 'William Lane Craig',
    title,
  })
  await merger.save(fileName)
  index = 0
}

const titlePrefix = 'Defenders Series 3:'

await makePdf(0, 3, 'book1-sections-1-3.pdf', `${titlePrefix} Sections 1-3`)
await makePdf(3, 1, 'book2-section-4.pdf', `${titlePrefix} Section 4`)
await makePdf(4, 2, 'book3-sections-5-6.pdf', `${titlePrefix} Sections 5-6`)
await makePdf(6, 1, 'book4-section-7.pdf', `${titlePrefix} Section 7`)
await makePdf(7, 1, 'book5-section-8.pdf', `${titlePrefix} Section 8`)
await makePdf(8, 1, 'book6-section-9.pdf', `${titlePrefix} Section 9`)
await makePdf(9, 2, 'book7-sections-10-11.pdf', `${titlePrefix} Sections 10-11`)
await makePdf(
  11,
  3,
  'book8-sections-12-14.pdf',
  `${titlePrefix} Sections 12-14`
)

await browser.close()

/**
 * Aiming for ~250 pages per book:
 *
 * Book 1: 1-3   (247 pages, $14.91)
 * Book 2: 4     (274 pages, $15.99)
 * Book 3: 5-6   (121 pages, $9.87)
 * Book 4: 7     (359 pages, $19.39)
 * Book 5: 8     (177 pages, $12.11)
 * Book 6: 9     (255 pages, $15.23)
 * Book 7: 10-11 (214 pages, $13.59)
 * Book 8: 12-14 (124 pages, $9.99)
 */
