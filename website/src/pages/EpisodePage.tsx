import {useParams, Link} from 'react-router-dom'
import {useRecoilValue} from 'recoil'
import {episodeSelectorFamily} from '../state/globalState'
import {makeTitle} from '../util/makeTitle'

export default function EpisodePage() {
  const {section: sectionSlug, episode: episodeSlug} = useParams()
  const episode = useRecoilValue(
    episodeSelectorFamily({sectionSlug, episodeSlug})
  )

  if (!episode) return <div>No episode found</div>

  return (
    <>
      <h1>{makeTitle(episode.title)}</h1>
    </>
  )
}
