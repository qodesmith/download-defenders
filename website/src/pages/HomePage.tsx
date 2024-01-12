import {sectionsQueryAtom} from '../state/globalState'
import {useAtomValue} from 'jotai/react'
import SectionBlock from '../components/SectionBlock'
import SeriesStats from '../components/SeriesStats'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  sectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridAutoRows: '125px',
    gap: '20px',
    padding: '20px 0',
  },
})

export default function HomePage() {
  const sections = useAtomValue(sectionsQueryAtom)

  return (
    <>
      <SeriesStats />
      <div {...stylex.props(styles.sectionGrid)}>
        {sections.map((section, i) => {
          return (
            <SectionBlock key={section.title} num={i + 1} section={section} />
          )
        })}
      </div>
    </>
  )
}
