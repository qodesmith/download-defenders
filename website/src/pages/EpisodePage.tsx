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
  console.log('MP4:', mp4)

  return (
    <>
      <h1>{makeTitle(episode.title)}</h1>
      {mp4 && (
        <Video controls width="500">
          <source src={`/defenders/${mp4}`} />
        </Video>
      )}
    </>
  )
}

const Video = styled.video`
  width: 50%;
  margin: 0 auto;
  display: block;
`
