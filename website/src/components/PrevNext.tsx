import * as stylex from '@stylexjs/stylex'
import {useAtomValue} from 'jotai'
import {Link} from 'react-router-dom'
import {sectionSelectorFamily} from '../state/globalState'

const styles = stylex.create({
  container: {
    display: 'flex',
    gap: '4em',
    justifyContent: 'center',
    marginTop: '3em',
  },
  pointer: {
    cursor: 'pointer',
    userSelect: 'none',
  },
})

type Props = {
  episodeIdx: number
  sectionSlug: string
}

export function PrevNext({episodeIdx, sectionSlug}: Props) {
  const {episodes, slug} =
    useAtomValue(sectionSelectorFamily(sectionSlug)) ?? {}
  if (!episodes || !slug) return null

  const previousEpisode = episodes[episodeIdx - 1]
  const nextEpisode = episodes[episodeIdx + 1]

  const previousLink = previousEpisode
    ? `/${slug}/${previousEpisode.slug}`
    : undefined
  const nextLink = nextEpisode ? `/${slug}/${nextEpisode.slug}` : undefined

  return (
    <div {...stylex.props(styles.container)}>
      {previousLink && (
        <Link to={previousLink} {...stylex.props(styles.pointer)}>
          &#10094; Previous
        </Link>
      )}
      {nextLink && (
        <Link to={nextLink} {...stylex.props(styles.pointer)}>
          Next &#10095;
        </Link>
      )}
    </div>
  )
}
