import {useAtomValue} from 'jotai'
import styled from 'styled-components'
import {statsSelector} from '../state/globalState'
import ProgressIndicator from './ProgressIndicator'

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
    <FlexContainer>
      <FlexCol>
        <div>
          {completedSectionsCount} / {totalSectionsCount} sections
        </div>
        <ProgressIndicator percent={sectionCompletionPercentage} />
      </FlexCol>
      <Divider />
      <FlexCol>
        <div>
          {completedEpisodesCount} / {totalEpisodesCount} episodes
        </div>
        <ProgressIndicator percent={episodeCompletionPercentage} />
      </FlexCol>
    </FlexContainer>
  )
}

const FlexContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 2em;
`

const FlexCol = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  align-items: center;
`

const Divider = styled.div`
  width: 1px;
  background: white;
  opacity: 0.2;
`
