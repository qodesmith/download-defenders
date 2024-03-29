import {useCallback, useEffect, useId, useRef} from 'react'
import {useParams} from 'react-router-dom'
import {
  episodeNumberSelectorFamily,
  episodeSelectorFamily,
  episodesCountSelectorFamily,
  getEpisodeNotionLinkSelectorFamily,
  updateEpisodeNotionLinkAtom,
} from '../state/globalState'
import {makeTitle} from '../util/makeTitle'
import {useAtomValue, useSetAtom} from 'jotai'
import EpisodeCheckbox from '../components/EpisodeCheckbox'
import {CopyAudioTime} from '../components/CopyAudioTime'
import * as stylex from '@stylexjs/stylex'
import {PrevNext} from '../components/PrevNext'
import {EpisodeNumberLinks} from '../components/EpisodeNumberLinks'
import {TrashCan} from '../components/TrashCan'

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
  inputContainer: {
    paddingTop: '1em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1em',
  },
  input: {
    fontFamily: 'inherit',
    padding: '.3em .5em',
    width: '60ch',
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
    /**
     * We add `episodeNumber` as a dependency so that when we navigate from one
     * episode to the next (i.e. the EpisodePage doesn't unmount) we re-trigger
     * setting the audio playback rate to 1.5x.
     */
  }, [episodeNumber])

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

      <div {...stylex.props(styles.inputContainer)}>
        <NotionLink sectionSlug={sectionSlug} episodeSlug={episodeSlug} />
      </div>

      {episodeNumber != null && sectionSlug && (
        <PrevNext episodeIdx={episodeNumber - 1} sectionSlug={sectionSlug} />
      )}
      <EpisodeNumberLinks />
    </>
  )
}

type NotionLinkProps = {
  sectionSlug?: string
  episodeSlug?: string
}

function NotionLink({sectionSlug, episodeSlug}: NotionLinkProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const setNotionLink = useSetAtom(updateEpisodeNotionLinkAtom)
  const notionLink = useAtomValue(
    getEpisodeNotionLinkSelectorFamily({sectionSlug, episodeSlug})
  )
  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const url = inputRef.current?.value
      setNotionLink({sectionSlug, episodeSlug, url})
    },
    [sectionSlug, episodeSlug]
  )
  const onRemove = useCallback(() => {
    setNotionLink({sectionSlug, episodeSlug})
  }, [sectionSlug, episodeSlug])

  if (notionLink) {
    return (
      <>
        <a href={notionLink} target="_blank">
          {`${notionLink.slice(0, 21)}...${notionLink.slice(-15)}`}
        </a>
        <TrashCan onClick={onRemove} />
      </>
    )
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        {...stylex.props(styles.input)}
        ref={inputRef}
        placeholder="Paste a Notion url..."
      />
    </form>
  )
}
