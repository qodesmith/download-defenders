import * as stylex from '@stylexjs/stylex'
import {useCallback, useState} from 'react'

const styles = stylex.create({
  svg: {
    cursor: 'pointer',
  },
  default: {
    fill: '#af1f1f',
    transition: 'fill .2s',
  },
  hovered: {
    fill: 'red',
  },
})

type Props = {
  size?: number
  onClick: () => void
}

// https://iconmonstr.com/trash-can-28-svg/
export function TrashCan({size = 16, onClick}: Props) {
  const [isHovered, setIsHovered] = useState(false)
  const onMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])
  const onMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  return (
    <svg
      {...stylex.props(styles.svg)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <path
        {...stylex.props(styles.default, isHovered && styles.hovered)}
        d="M19 24h-14c-1.104 0-2-.896-2-2v-17h-1v-2h6v-1.5c0-.827.673-1.5 1.5-1.5h5c.825 0 1.5.671 1.5 1.5v1.5h6v2h-1v17c0 1.104-.896 2-2 2zm0-19h-14v16.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-16.5zm-9 4c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6 0c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm-2-7h-4v1h4v-1z"
      />
    </svg>
  )
}
