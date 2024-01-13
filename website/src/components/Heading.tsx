import {ReactNode} from 'react'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  h1: {
    fontSize: '3.2em',
    lineHeight: '1.1',
    fontWeight: 'bold',
  },
  grid: {
    padding: '1em 0',
    display: 'grid',
    gridTemplateColumns: '50px 1fr',
    gridTemplateRows: 'auto',
    gridTemplateAreas: `
      'number title'
      '. url'
    `,
  },
  link: {
    gridArea: 'url',
  },
})

type Props = {
  number: ReactNode
  title: string
  url: string
}

export default function Heading({number, title, url}: Props) {
  return (
    <div {...stylex.props(styles.grid)}>
      <div {...stylex.props(styles.h1)}>{number}</div>
      <div {...stylex.props(styles.h1)}>{title}</div>
      <a href={url} target="_blank" {...stylex.props(styles.link)}>
        {url}
      </a>
    </div>
  )
}
