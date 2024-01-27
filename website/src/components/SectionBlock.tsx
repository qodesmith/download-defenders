import ProgressIndicator from './ProgressIndicator'
import {Link} from 'react-router-dom'
import {useAtomValue} from 'jotai'
import {
  completedSectionEpisodesSelectorFamily,
  getSavedProgressPercentSelectorFamily,
  totalSectionTimeSelectorFamily,
} from '../state/globalState'
import {DefendersData} from '../../../websiteMiddlewares'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  sectionContainer: {
    width: '100%',
    border: '1px solid #333',
    borderRadius: '1em',
    padding: '10px',
    textAlign: 'center',
    position: 'relative',
  },
  noMargin: {
    margin: 0,
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  small: {
    fontSize: '0.7em',
  },
  number: {
    position: 'absolute',
    top: '50%',
    left: '100%',
    transform: 'translate(-100%, -50%)',
    paddingRight: '10px',
    color: '#333',
    fontWeight: 'bold',
    fontSize: '4em',
    zIndex: '-1',
    opacity: '0.5',
  },
  progressIndicatorContainer: {
    position: 'absolute',
    width: '100%',
    left: '0',
    padding: '0 0.5em 0.5em',
    bottom: '0',
  },
  episodesComplete: {
    position: 'absolute',
    bottom: '.25em',
    left: '50%',
    transform: 'translateX(-50%)',
    lineHeight: 1,
  },
})

type Props = {
  num: number
  section: DefendersData[number]
}

export default function SectionBlock({num, section}: Props) {
  const progressPercent = useAtomValue(
    getSavedProgressPercentSelectorFamily(section.slug)
  )
  const totalRuntime = useAtomValue(
    totalSectionTimeSelectorFamily(section.slug)
  )
  const boldCls = stylex.props(styles.bold).className
  const completedEpisodes = useAtomValue(
    completedSectionEpisodesSelectorFamily(section.slug)
  )

  return (
    <section {...stylex.props(styles.sectionContainer)}>
      <h2 {...stylex.props(styles.noMargin)}>
        <Link className={boldCls} to={section.slug}>
          {section.title}
        </Link>
      </h2>
      <div {...stylex.props(styles.italic)}>
        {section.episodes.length} episodes{' '}
        <span {...stylex.props(styles.small)}>({totalRuntime})</span>
      </div>
      <div {...stylex.props(styles.number)}>{num}</div>
      <div {...stylex.props(styles.progressIndicatorContainer)}>
        <ProgressIndicator percent={progressPercent} />
      </div>
      <div {...stylex.props(styles.small, styles.episodesComplete)}>
        {completedEpisodes}
      </div>
    </section>
  )
}
