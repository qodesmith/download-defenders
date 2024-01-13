import {useParams, Link} from 'react-router-dom'
import {
  getSavedProgressEpisodeSelectorFamily,
  sectionNumberSelectorFamily,
  sectionSelectorFamily,
} from '../state/globalState'
import {makeTitle} from '../util/makeTitle'
import {useAtomValue} from 'jotai'
import {useId} from 'react'
import ResetSectionButton from '../components/ResetSectionButton'
import CompleteSectionButton from '../components/CompleteSectionButton'
import NotionLogo from '../components/NotionLogo'
import EpisodeCheckbox from '../components/EpisodeCheckbox'
import Heading from '../components/Heading'
import {DefendersData} from '../../../websiteMiddlewares'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  ul: {
    listStyle: 'none',
  },
  li: {
    margin: '5px 0',
    display: 'flex',
    alignItems: 'center',
  },
  sectionNumber: {
    color: '#333',
  },
  episodeNumber: {
    paddingRight: '0.5em',
    paddingLeft: '0.5em',
  },
  buttonContainer: {
    display: 'flex',
    gap: '0.5em',
  },
  notionLogoContainer: {
    paddingRight: '0.5em',
  },
})

export default function SectionPage() {
  const {section: slug} = useParams()
  const section = useAtomValue(sectionSelectorFamily(slug))
  const sectionNumber = useAtomValue(sectionNumberSelectorFamily(slug))

  if (!section) return <div>No section found</div>

  return (
    <>
      <Heading
        title={section.title}
        number={
          <span {...stylex.props(styles.sectionNumber)}>{sectionNumber}</span>
        }
        url={section.url}
      />
      <ul {...stylex.props(styles.ul)}>
        <div {...stylex.props(styles.buttonContainer)}>
          <ResetSectionButton sectionSlug={section.slug} />
          <CompleteSectionButton sectionSlug={section.slug} />
        </div>
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
      </ul>
    </>
  )
}

type ListItemProps = {
  sectionSlug: string
  episode: DefendersData[number]['episodes'][number]
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
  const checkboxId = useId()

  return (
    <li key={episode.title} {...stylex.props(styles.li)}>
      <EpisodeCheckbox
        id={checkboxId}
        sectionSlug={sectionSlug}
        episodeSlug={episode.slug}
      />
      <div {...stylex.props(styles.episodeNumber)}>{episodeNumber}.</div>
      <div {...stylex.props(styles.notionLogoContainer)}>
        <NotionLogo size={20} url="" />
      </div>
      <Link style={textStyle} to={episode.slug}>
        {makeTitle(episode.title)}
      </Link>
    </li>
  )
}
