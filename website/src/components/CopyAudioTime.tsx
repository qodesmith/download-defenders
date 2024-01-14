import {useCallback, useEffect, useState} from 'react'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5em',
    userSelect: 'none',
    '--icon-border-color': '#aaa',
  },
  subContainer: {
    ':hover': {
      '--icon-border-color': 'white',
    },
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
    border: '1px solid var(--icon-border-color)',
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
  transparent: {
    opacity: 0.5,
  },
})

type Props = {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>
  episodeTitle: string
}

export function CopyAudioTime({audioRef, episodeTitle}: Props) {
  return (
    <>
      {/* COPY TIME & EPISODE LINK */}
      <CopyToClipboard
        includeEpisodeLink
        audioRef={audioRef}
        episodeTitle={episodeTitle}
      />

      {/* COPY TIME ONLY */}
      <CopyToClipboard audioRef={audioRef} episodeTitle={episodeTitle} />
    </>
  )
}

type CopyToClipboardProps = Props & {
  includeEpisodeLink?: boolean
}

function CopyToClipboard({
  includeEpisodeLink,
  audioRef,
  episodeTitle,
}: CopyToClipboardProps) {
  const handleOnClick = useCallback(() => {
    const audioEl = audioRef.current
    if (!audioEl) return

    const time = Math.round(audioEl.currentTime)
    const minutes = Math.floor(time / 60)
    const seconds = `${time - minutes * 60}`.padStart(2, '0')
    const displayTime = `${minutes}:${seconds}`
    const url = new URL(window.location.href)
    url.searchParams.set('t', `${time}`)
    const finalText = includeEpisodeLink
      ? `[${displayTime} - ${episodeTitle}](${url})`
      : `[${displayTime}](${url})`

    navigator.clipboard.writeText(finalText)
  }, [includeEpisodeLink])
  const [isPressed, setIsPressed] = useState(false)
  const handleOnMouseDown = useCallback(() => {
    setIsPressed(true)
  }, [])

  useEffect(() => {
    const onMouseUp = () => setIsPressed(false)
    document.addEventListener('mouseup', onMouseUp)

    return () => document.removeEventListener('mouseup', onMouseUp)
  }, [])

  return (
    // CONTAINER - spans the width of the page
    <div
      {...stylex.props(
        styles.container,
        styles.cursorInitial,
        isPressed && styles.transparent
      )}
    >
      {/* SUB CONTAINER - spans only the width of the content */}
      <div
        onClick={handleOnClick}
        {...stylex.props(
          styles.container,
          styles.subContainer,
          styles.cursorPointer
        )}
        onMouseDown={handleOnMouseDown}
      >
        {/* ICON */}
        <div {...stylex.props(styles.iconContainer)}>
          <div {...stylex.props(styles.copyIcon)} />
          <div {...stylex.props(styles.copyIcon, styles.copyIconRear)} />
        </div>

        {/* TEXT */}
        <span>Copy time{includeEpisodeLink ? ' & episode link' : ''}</span>
      </div>
    </div>
  )
}
