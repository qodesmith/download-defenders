import styled from 'styled-components'
import {sectionsQueryAtom} from '../state/globalState'
import {useAtomValue} from 'jotai/react'
import SectionBlock from '../components/SectionBlock'
import SeriesStats from '../components/SeriesStats'

export default function HomePage() {
  const sections = useAtomValue(sectionsQueryAtom)

  return (
    <>
      <SeriesStats />
      <SectionsGrid>
        {sections.map((section, i) => {
          return (
            <SectionBlock key={section.title} num={i + 1} section={section} />
          )
        })}
      </SectionsGrid>
    </>
  )
}

const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 125px;
  gap: 20px;
  padding: 20px 0;
`
