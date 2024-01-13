import {useCallback} from 'react'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5em',
    userSelect: 'none',
  },
  cursorPointer: {
    cursor: 'pointer',
  },
  cursorInitial: {
    cursor: 'initial',
  },
  iconContainer: {
    position: 'relative',
    height: '1em',
    width: '1em',
  },
  copyIcon: {
    width: '0.75em',
    height: '1em',
    border: '1px solid #aaa',
    borderRadius: '0.2em',
    background: '#555',
    position: 'absolute',
    zIndex: 1,
    transform: 'rotate(-5deg)',
    right: 0,
  },
  copyIconRear: {
    zIndex: 0,
    transform: 'rotate(-20deg)',
    right: '0.2em',
  },
})

type Props = {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>
  episodeTitle: string
}

export function CopyAudioTime({audioRef, episodeTitle}: Props) {
  const handleOnClick = useCallback(() => {
    const audioEl = audioRef.current
    if (!audioEl) return

    const time = Math.round(audioEl.currentTime)
    const minutes = Math.floor(time / 60)
    const seconds = `${time - minutes * 60}`.padStart(2, '0')
    const displayTime = `${minutes}:${seconds}`
    const url = new URL(window.location.href)
    url.searchParams.set('t', `${time}`)
    const finalText = `[${displayTime} - ${episodeTitle}](${url})`

    navigator.clipboard.writeText(finalText)
  }, [])

  const handleOnClick2 = useCallback(() => {
    const audioEl = audioRef.current
    if (!audioEl) return

    const time = Math.round(audioEl.currentTime)
    const minutes = Math.floor(time / 60)
    const seconds = `${time - minutes * 60}`.padStart(2, '0')
    const displayTime = `${minutes}:${seconds}`
    const url = new URL(window.location.href)
    url.searchParams.set('t', `${time}`)
    const finalText = `[${displayTime}](${url})`

    navigator.clipboard.writeText(finalText)
  }, [])

  return (
    <>
      <div {...stylex.props(styles.container, styles.cursorInitial)}>
        <div
          onClick={handleOnClick}
          {...stylex.props(styles.container, styles.cursorPointer)}
        >
          <div {...stylex.props(styles.iconContainer)}>
            <div {...stylex.props(styles.copyIcon)} />
            <div {...stylex.props(styles.copyIcon, styles.copyIconRear)} />
          </div>
          <span>Copy time & episode link</span>
        </div>
      </div>
      <div {...stylex.props(styles.container, styles.cursorInitial)}>
        <div
          onClick={handleOnClick2}
          {...stylex.props(styles.container, styles.cursorPointer)}
        >
          <div {...stylex.props(styles.iconContainer)}>
            <div {...stylex.props(styles.copyIcon)} />
            <div {...stylex.props(styles.copyIcon, styles.copyIconRear)} />
          </div>
          <span>Copy time</span>
        </div>
      </div>
    </>
  )
}
