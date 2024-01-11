import {useCallback} from 'react'
import styled from 'styled-components'

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
      <Container>
        <Container pointer onClick={handleOnClick}>
          <IconContainer>
            <CopyIcon />
            <CopyIcon rear />
          </IconContainer>
          <span>Copy time & episode link</span>
        </Container>
      </Container>
      <Container>
        <Container pointer onClick={handleOnClick2}>
          <IconContainer>
            <CopyIcon />
            <CopyIcon rear />
          </IconContainer>
          <span>Copy time</span>
        </Container>
      </Container>
    </>
  )
}

const Container = styled.div<{pointer?: boolean}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  user-select: none;
  cursor: ${props => (props.pointer ? 'pointer' : 'initial')};
`

const IconContainer = styled.div`
  position: relative;
  height: 1em;
  width: 1em;
`

const CopyIcon = styled.div<{rear?: boolean}>`
  width: 0.75em;
  height: 1em;
  border: 1px solid #aaa;
  border-radius: 0.2em;
  background: #555;
  position: absolute;
  z-index: ${props => (props.rear ? 0 : 1)};
  transform: rotate(${props => (props.rear ? -20 : -5)}deg);
  right: ${props => (props.rear ? 0.2 : 0)}em;
`
