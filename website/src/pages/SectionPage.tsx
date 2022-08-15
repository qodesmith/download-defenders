import {useParams, Link} from 'react-router-dom'
import {useRecoilValue} from 'recoil'
import styled from 'styled-components'
import {sectionSelectorFamily} from '../state/globalState'
import {makeTitle} from '../util/makeTitle'

export default function SectionPage() {
  const {section: slug} = useParams()
  const section = useRecoilValue(sectionSelectorFamily(slug))

  if (!section) return <div>No section found</div>

  return (
    <>
      <h1>{section.sectionName}</h1>
      <Ul>
        {section.episodes.map(episode => {
          return (
            <Li key={episode.title}>
              <Link to={episode.slug}>{makeTitle(episode.title)}</Link>
            </Li>
          )
        })}
      </Ul>
    </>
  )
}

const Ul = styled.ul`
  list-style: number;
`

const Li = styled.li`
  margin: 5px 0;
`
