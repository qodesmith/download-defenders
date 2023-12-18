import {useParams, Link} from 'react-router-dom'
import styled from 'styled-components'
import {
  sectionNumberSelectorFamily,
  sectionSelectorFamily,
} from '../state/globalState'
import {makeTitle} from '../util/makeTitle'
import {useAtomValue} from 'jotai'

export default function SectionPage() {
  const {section: slug} = useParams()
  const section = useAtomValue(sectionSelectorFamily(slug))
  const sectionNumber = useAtomValue(sectionNumberSelectorFamily(slug))

  if (!section) return <div>No section found</div>

  return (
    <>
      <h1>
        <SectionNumber>{sectionNumber}</SectionNumber> {section.sectionName}
      </h1>
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

const SectionNumber = styled.span`
  color: #333;
`
