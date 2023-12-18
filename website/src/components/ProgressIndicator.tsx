import {useAtomValue} from 'jotai'
import styled from 'styled-components'
import {getSavedProgressPercentSelectorFamily} from '../state/globalState'

type Props = {
  sectionSlug: string
}

export default function ProgressIndicator({sectionSlug}: Props) {
  const progressPercent = useAtomValue(
    getSavedProgressPercentSelectorFamily(sectionSlug)
  )

  return (
    <ProgressContainer>
      <Bar progress={progressPercent} />
      <div>{progressPercent}%</div>
    </ProgressContainer>
  )
}

const ProgressContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.7em;
  font-size: 0.7em;
`

const Bar = styled.div<{progress: number}>`
  flex-grow: 1;
  background: #626567;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  height: 4px;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 4px;
    background: cyan;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    width: ${props => props.progress}%;
  }
`
