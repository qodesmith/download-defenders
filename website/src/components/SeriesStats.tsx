import {useAtomValue} from 'jotai'
import {statsSelector} from '../state/globalState'
import ProgressIndicator from './ProgressIndicator'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  flexContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: '2em',
  },
  flexCol: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
    alignItems: 'center',
  },
  divider: {
    width: '1px',
    background: 'white',
    opacity: '0.2',
  },
})

export default function SeriesStats() {
  const {
    sectionCompletionPercentage,
    episodeCompletionPercentage,
    totalEpisodesCount,
    totalSectionsCount,
    completedEpisodesCount,
    completedSectionsCount,
  } = useAtomValue(statsSelector)

  return (
    <div {...stylex.props(styles.flexContainer)}>
      <div {...stylex.props(styles.flexCol)}>
        <div>
          {completedSectionsCount} / {totalSectionsCount} sections
        </div>
        <ProgressIndicator percent={sectionCompletionPercentage} />
      </div>
      <div {...stylex.props(styles.divider)} />
      <div {...stylex.props(styles.flexCol)}>
        <div>
          {completedEpisodesCount} / {totalEpisodesCount} episodes
        </div>
        <ProgressIndicator percent={episodeCompletionPercentage} />
      </div>
    </div>
  )
}
