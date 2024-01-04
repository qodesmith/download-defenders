import {useCallback, useId} from 'react'
import {useParams} from 'react-router-dom'
import styled from 'styled-components'
import {
  episodeNumberSelectorFamily,
  episodeSelectorFamily,
  episodesCountSelectorFamily,
} from '../state/globalState'
import {makeTitle} from '../util/makeTitle'
import {useAtomValue} from 'jotai'
import EpisodeCheckbox from '../components/EpisodeCheckbox'

export default function EpisodePage() {
  const {section: sectionSlug, episode: episodeSlug} = useParams()
  const episode = useAtomValue(
    episodeSelectorFamily({sectionSlug, episodeSlug})
  )
  const episodeNumber = useAtomValue(
    episodeNumberSelectorFamily({sectionSlug, episodeSlug})
  )
  const episodesCount = useAtomValue(episodesCountSelectorFamily(sectionSlug))
  const refSetPlaybackRate = useCallback(
    (el: HTMLVideoElement | HTMLAudioElement | null) => {
      if (el?.playbackRate) el.playbackRate = 1.5
    },
    []
  )
  const checkboxId = useId()

  if (!episode) return <div>No episode found</div>

  const {mp4, mp3} = episode.fileNames

  return (
    <>
      <H1>
        {makeTitle(episode.title)}
        <EpisodeNumber>
          <a href={episode.url} target="_blank">
            Episode {episodeNumber} of {episodesCount}
          </a>
        </EpisodeNumber>
      </H1>

      {mp4 && false ? (
        <Video controls ref={refSetPlaybackRate}>
          <source src={`/defenders/${mp4}`} type="video/mp4" />
        </Video>
      ) : (
        <Audio controls ref={refSetPlaybackRate} src={`/defenders/${mp3}`} />
      )}
      <CompleteContainer>
        <EpisodeCheckbox
          id={checkboxId}
          sectionSlug={sectionSlug}
          episodeSlug={episodeSlug}
        />
        <label htmlFor={checkboxId}>Episode complete</label>
      </CompleteContainer>
    </>
  )
}

const H1 = styled.h1`
  text-align: center;
  position: relative;
`

const Video = styled.video`
  width: 50%;
  min-width: 400px;
  margin: 0 auto;
  display: block;
  border-radius: 25px;
`

const Audio = styled.audio`
  width: 50%;
  min-width: 400px;
  display: block;
  margin: 0 auto;
`

const EpisodeNumber = styled.div`
  font-size: 1rem;
`

const CompleteContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: baseline;
  padding-top: 1em;

  input {
    margin-right: 0.5em;
  }
`

const NotionUrlContainer = styled.div``
