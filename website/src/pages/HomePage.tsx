import {useRecoilValue} from 'recoil'
import styled from 'styled-components'
import {Link} from 'react-router-dom'
import {sectionsQueryAtom} from '../state/globalState'
import {SectionType} from '../../../websiteMiddlewares'

export default function HomePage() {
  const sections = useRecoilValue(sectionsQueryAtom)

  return (
    <SectionsGrid>
      {sections.map((section, i) => {
        return (
          <Section key={section.sectionName} num={i + 1} section={section} />
        )
      })}
    </SectionsGrid>
  )
}

type SectionProps = {
  num: number
  section: SectionType
}

function Section({num, section}: SectionProps) {
  return (
    <SectionContainer>
      <H2>
        <Link to={section.slug}>{section.sectionName}</Link>
      </H2>
      <Episodes>{section.episodes.length} episodes</Episodes>
      <Number>{num}</Number>
    </SectionContainer>
  )
}

const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 100px;
  gap: 20px;
  padding: 20px 0;
`

const SectionContainer = styled.section`
  width: 100%;
  border: 1px solid #333;
  border-radius: 20px;
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
