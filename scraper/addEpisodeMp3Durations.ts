import type {
  EpisodeWithMediaMetadata,
  FullSectionMetadata,
} from './genEpisodesMediaMetadata'
import musicMetadata from 'music-metadata'
import fs from 'fs-extra'

export type CompleteSectionMetadata = FullSectionMetadata & {
  episodes: (EpisodeWithMediaMetadata & {
    mp3Duration: number
  })[]
}

export async function addEpisodeMp3Durations(
  sections: FullSectionMetadata[]
): Promise<CompleteSectionMetadata[]> {
  const finalSections: CompleteSectionMetadata[] = []

  for (let sectionIdx = 0; sectionIdx < sections.length; sectionIdx++) {
    const section = sections[sectionIdx]
    const newEpisodes: CompleteSectionMetadata['episodes'] = []

    for (
      let episodeIdx = 0;
      episodeIdx < section.episodes.length;
      episodeIdx++
    ) {
      const episode = section.episodes[episodeIdx]
      let mp3Duration: number | undefined

      try {
        const buffer = new Uint8Array(fs.readFileSync(episode.mp3Path))
        const mp3Metadata = await musicMetadata.parseBuffer(buffer)
        mp3Duration = mp3Metadata.format.duration
      } catch (e) {
        console.error('Error with "music-metadata" package:')
        throw e
      }

      if (!mp3Duration) {
        throw new Error(
          `No duration found for ${section.title} / ${episode.title}`
        )
      }

      newEpisodes.push({...episode, mp3Duration: Math.floor(mp3Duration)})
    }

    finalSections.push({...section, episodes: newEpisodes})
  }

  return finalSections
}
