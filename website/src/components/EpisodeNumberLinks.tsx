import {useAtomValue} from 'jotai'
import {Link, useParams} from 'react-router-dom'
import {sectionSelectorFamily} from '../state/globalState'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  container: {
    maxWidth: '600px',
    display: 'flex',
    gap: '.5em',
    flexWrap: 'wrap',
    justifyContent: 'center',
    margin: '0 auto',
    fontSize: '.8em',
  },
  underline: {
    textDecoration: 'underline',
  },
})

export function EpisodeNumberLinks() {
  const {section: sectionSlug, episode: episodeSlug} = useParams()
  const {episodes} = useAtomValue(sectionSelectorFamily(sectionSlug)) ?? {}

  if (!episodes) return null

  return (
    <div {...stylex.props(styles.container)}>
      {episodes.map((episode, i) => {
        const num = i + 1
        const to = `/${sectionSlug}/${episode.slug}`
        const isCurrentEpisode = episode.slug === episodeSlug

        return (
          <Link
            to={to}
            key={num}
            {...stylex.props(isCurrentEpisode && styles.underline)}
          >
            {num}
          </Link>
        )
      })}
    </div>
  )
}
