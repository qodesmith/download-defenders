import styled from 'styled-components'
import ProgressIndicator from './ProgressIndicator'
import {Link} from 'react-router-dom'
import {useAtomValue} from 'jotai'
import {
  getSavedProgressPercentSelectorFamily,
  totalSectionTimeSelectorFamily,
} from '../state/globalState'
import {DefendersData} from '../../../websiteMiddlewares'

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

  return (
    <SectionContainer>
      <H2>
        <Link to={section.slug}>{section.title}</Link>
      </H2>
      <Episodes>
        {section.episodes.length} episodes <Small>({totalRuntime})</Small>
      </Episodes>
      <Number>{num}</Number>
      <ProgressIndicatorContainer>
        <ProgressIndicator percent={progressPercent} />
      </ProgressIndicatorContainer>
    </SectionContainer>
  )
}

const SectionContainer = styled.section`
  width: 100%;
  border: 1px solid #333;
  border-radius: 1em;
  padding: 10px;
  text-align: center;
  position: relative;
`

const H2 = styled.h2`
  margin: 0;

  a {
    font-weight: bold;
  }
`

const Episodes = styled.div`
  font-style: italic;
`

const Small = styled.span`
  font-size: 0.7em;
`

const Number = styled.div`
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translate(-100%, -50%);
  padding-right: 10px;
  color: #333;
  font-weight: bold;
  font-size: 4em;
  z-index: -1;
  opacity: 0.5;
`

const ProgressIndicatorContainer = styled.div`
  position: absolute;
  width: 100%;
  left: 0;
  padding: 0 0.5em 0.5em;
  bottom: 0;
`
