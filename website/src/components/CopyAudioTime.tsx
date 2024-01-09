import {useCallback} from 'react'
import styled from 'styled-components'

type Props = {
  audioEl: HTMLAudioElement
}

export function CopyAudioTime({audioEl}: Props) {
  const handleOnClick = useCallback(() => {
    navigator.clipboard.writeText(Math.round(audioEl.currentTime).toString())
  }, [])

  return (
    <Container>
      <Container pointer onClick={handleOnClick}>
        <IconContainer>
          <CopyIcon />
          <CopyIcon rear />
        </IconContainer>
        <span>Copy audio time</span>
      </Container>
    </Container>
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
