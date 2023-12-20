import styled from 'styled-components'

type Props = {
  percent: number
}

export default function ProgressIndicator({percent}: Props) {
  return (
    <ProgressContainer>
      <Bar percent={percent} />
      <div>{percent}%</div>
    </ProgressContainer>
  )
}

const ProgressContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.7em;
  font-size: 0.7em;
`

const Bar = styled.div<{percent: number}>`
  flex-grow: 1;
  background: #626567;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  height: 4px;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 4px;
    background: cyan;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    width: ${props => props.percent}%;
  }
`
