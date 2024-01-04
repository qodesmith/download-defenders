import {ReactNode} from 'react'
import styled from 'styled-components'

type Props = {
  number: ReactNode
  title: string
  url: string
}

export default function Heading({number, title, url}: Props) {
  return (
    <Grid>
      <H1>{number}</H1>
      <H1>{title}</H1>
      <Url href={url} target="_blank">
        {url}
      </Url>
    </Grid>
  )
}

const H1 = styled.div`
  font-size: 3.2em;
  line-height: 1.1;
  font-weight: bold;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 50px 1fr;
  grid-template-rows: auto;
  grid-template-areas:
    'number title'
    '. url';
  padding: 1em 0;
`

const Url = styled.a`
  grid-area: url;
`
