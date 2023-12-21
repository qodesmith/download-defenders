import {useParams, Link} from 'react-router-dom'
import styled from 'styled-components'
import {
  getSavedProgressEpisodeSelectorFamily,
  sectionNumberSelectorFamily,
  sectionSelectorFamily,
  updateEpisodeCompletionAtom,
} from '../state/globalState'
import {makeTitle} from '../util/makeTitle'
import {useAtomValue, useSetAtom} from 'jotai'
import {EpisodeType} from '../../../websiteMiddlewares'
import {useCallback} from 'react'
import ResetSectionButton from '../components/ResetSectionButton'
import CompleteSectionButton from '../components/CompleteSectionButton'
import NotionLogo from '../components/NotionLogo'

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
        <ButtonContainer>
          <ResetSectionButton sectionSlug={section.slug} />
          <CompleteSectionButton sectionSlug={section.slug} />
        </ButtonContainer>
        {section.episodes.map((episode, i) => {
          return (
            <ListItem
              key={episode.slug}
              sectionSlug={section.slug}
              episode={episode}
              episodeNumber={i + 1}
            />
          )
        })}
      </Ul>
    </>
  )
}

type ListItemProps = {
  sectionSlug: string
  episode: EpisodeType
  episodeNumber: number
}

function ListItem({sectionSlug, episode, episodeNumber}: ListItemProps) {
  const isChecked = useAtomValue(
    getSavedProgressEpisodeSelectorFamily({
      sectionSlug,
      episodeSlug: episode.slug,
    })
  )
  const textStyle = {textDecoration: isChecked ? 'line-through' : 'initial'}
  const updateEpisodeCompletion = useSetAtom(updateEpisodeCompletionAtom)
  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateEpisodeCompletion({
        sectionSlug,
        episodeSlug: episode.slug,
        isComplete: e.target.checked,
      })
    },
    []
  )

  return (
    <Li key={episode.title}>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleCheckboxChange}
      />
      <EpisodeNumber>{episodeNumber}.</EpisodeNumber>
      <NotionLogoContainer>
        <NotionLogo size={20} url="" />
      </NotionLogoContainer>
      <Link style={textStyle} to={episode.slug}>
        {makeTitle(episode.title)}
      </Link>
    </Li>
  )
}

const Ul = styled.ul`
  list-style: none;
`

const Li = styled.li`
  margin: 5px 0;
  display: flex;
  align-items: center;
`

const SectionNumber = styled.span`
  color: #333;
`

const EpisodeNumber = styled.div`
  padding-right: 0.5em;
  padding-left: 0.5em;
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5em;
`

const NotionLogoContainer = styled.div`
  padding-right: 0.5em;
`
