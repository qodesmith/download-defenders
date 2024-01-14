import {useEffect, useId, useRef} from 'react'
import {useParams} from 'react-router-dom'
import {
  episodeNumberSelectorFamily,
  episodeSelectorFamily,
  episodesCountSelectorFamily,
} from '../state/globalState'
import {makeTitle} from '../util/makeTitle'
import {useAtomValue} from 'jotai'
import EpisodeCheckbox from '../components/EpisodeCheckbox'
import {CopyAudioTime} from '../components/CopyAudioTime'
import * as stylex from '@stylexjs/stylex'
import {PrevNext} from '../components/PrevNext'
import {EpisodeNumberLinks} from '../components/EpisodeNumberLinks'

const styles = stylex.create({
  h1: {
    textAlign: 'center',
    position: 'relative',
  },
  audio: {
    width: '50%',
    minWidth: '400px',
    display: 'block',
    margin: '0 auto',
  },
  episodeNumber: {
    fontSize: '1rem',
  },
  completeContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    paddingTop: '1em',
  },
  completeContainerInput: {
    marginRight: '0.5em',
  },
  actionsContainer: {
    display: 'flex',
    gap: '2em',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
})

export default function EpisodePage() {
  const {section: sectionSlug, episode: episodeSlug} = useParams()
  const episode = useAtomValue(
    episodeSelectorFamily({sectionSlug, episodeSlug})
  )
  const episodeNumber = useAtomValue(
    episodeNumberSelectorFamily({sectionSlug, episodeSlug})
  )
  const episodesCount = useAtomValue(episodesCountSelectorFamily(sectionSlug))
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const checkboxId = useId()

  useEffect(() => {
    // We're only using the audio files.
    const audio = audioRef.current
    if (!audio) return

    const time = new URL(window.location.href).searchParams.get('t') ?? ''
    if (!isNaN(+time)) {
      audio.currentTime = +time
    }

    audio.playbackRate = 1.5
    const listener = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          return audio.paused ? audio.play() : audio.pause()
        case 'ArrowLeft':
          return (audio.currentTime -= 10) // Rewind by 10 seconds
        case 'ArrowRight':
          return (audio.currentTime += 10) // Forward by 10 seconds
      }
    }

    document.addEventListener('keydown', listener)

    return () => {
      document.removeEventListener('keydown', listener)
    }
  }, [])

  if (!episode) return <div>No episode found</div>
  const episodeTitle = makeTitle(episode.title)
  const audioSrc = `/${sectionSlug}/${episodeSlug}.mp3`

  return (
    <>
      <h1 {...stylex.props(styles.h1)}>
        {episodeTitle}
        <div {...stylex.props(styles.episodeNumber)}>
          <a href={episode.url} target="_blank">
            Episode {episodeNumber} of {episodesCount}
          </a>
        </div>
      </h1>
      <audio
        controls
        ref={audioRef}
        src={audioSrc}
        {...stylex.props(styles.audio)}
      />
      <div {...stylex.props(styles.actionsContainer)}>
        <div {...stylex.props(styles.completeContainer)}>
          <EpisodeCheckbox
            id={checkboxId}
            sectionSlug={sectionSlug}
            episodeSlug={episodeSlug}
            styles={styles.completeContainerInput}
          />
          <label htmlFor={checkboxId}>Episode complete</label>
        </div>
        <CopyAudioTime audioRef={audioRef} episodeTitle={episodeTitle} />
      </div>
      {episodeNumber != null && sectionSlug && (
        <PrevNext episodeIdx={episodeNumber - 1} sectionSlug={sectionSlug} />
      )}
      <EpisodeNumberLinks />
    </>
  )
}
