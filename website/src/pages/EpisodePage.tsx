import {useParams} from 'react-router-dom'
import {useRecoilValue} from 'recoil'
import styled from 'styled-components'
import {episodeSelectorFamily} from '../state/globalState'
import {makeTitle} from '../util/makeTitle'

export default function EpisodePage() {
  const {section: sectionSlug, episode: episodeSlug} = useParams()
  const episode = useRecoilValue(
    episodeSelectorFamily({sectionSlug, episodeSlug})
  )

  if (!episode) return <div>No episode found</div>

  const {mp4, mp3} = episode.fileNames

  return (
    <>
      <H1>{makeTitle(episode.title)}</H1>
      {mp4 ? (
        <Video controls>
          <source src={`/defenders/${mp4}`} type="video/mp4" />
        </Video>
      ) : (
        <Audio controls src={`/defenders/${mp3}`} />
      )}
    </>
  )
}

const H1 = styled.h1`
  text-align: center;
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
