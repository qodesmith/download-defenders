import styled from 'styled-components'
import {Link, useLocation} from 'react-router-dom'
import {useRecoilValue} from 'recoil'
import rfLogo from '../assets/rf-logo.png'
import {sectionSelectorFamily} from '../state/globalState'

export default function Header() {
  const {pathname} = useLocation()
  const [sectionSlug, episodeSlug] = pathname.slice(1).split('/')
  const section = useRecoilValue(sectionSelectorFamily(sectionSlug))
  const showSectionLink = !!section && !!episodeSlug

  return (
    <StyledHeader height="100px">
      <LinksContainer>
        {sectionSlug && <Link to="/">All Sections</Link>}
        {showSectionLink && (
          <Link to={`/${section.slug}`}>{section.sectionName}</Link>
        )}
      </LinksContainer>
      <a className="rf-logo" href="https://reasonablefaith.org" target="_blank">
        <img src={rfLogo} alt="Reasonable Faith logo" />
      </a>
    </StyledHeader>
  )
}

const StyledHeader = styled.header<{height: string}>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 20px;
  height: ${props => props.height};
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0) 100%
  );
`

const LinksContainer = styled.div`
  a {
    margin-right: 20px;
  }
`
