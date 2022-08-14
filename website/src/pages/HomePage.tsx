import rfLogo from '../assets/rf-logo.png'
import styled from 'styled-components'
import {useRecoilValue} from 'recoil'
import {sectionsQueryAtom} from '../state/globalState'

export default function HomePage() {
  const sections = useRecoilValue(sectionsQueryAtom)
  console.log(sections)

  return (
    <Header height="100px">
      <a className="rf-logo" href="https://reasonablefaith.org" target="_blank">
        <img src={rfLogo} alt="Reasonable Faith logo" />
      </a>
    </Header>
  )
}

const Header = styled.header<{height: string}>`
  position: fixed;
  top: 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  height: ${props => props.height};
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0) 100%
  );
`
