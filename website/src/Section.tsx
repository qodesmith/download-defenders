import type {SectionType} from '../../websiteMiddlewares.js'

import styled from 'styled-components'

export default function Section({
  section,
  num,
}: {
  section: SectionType
  num: number
}) {
  return (
    <Container>
      <a href="#">
        <H2>{section.sectionName}</H2>
      </a>
      <div>{section.episodes.length} episodes</div>
      <Index>{num}</Index>
    </Container>
  )
}

const Container = styled.section`
  width: 300px;
  height: 300px;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 10px;
  border-radius: 20px;
  position: relative;
`

const H2 = styled.h2`
  margin-bottom: 0;
`

const Index = styled.div`
  position: absolute;
  top: 50;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
  opacity: 0.025;
  font-size: 14em;
  line-height: 0;
  font-weight: bold;
`
