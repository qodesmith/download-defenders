import {Link, useLocation} from 'react-router-dom'
import rfLogo from '../assets/rf-logo.png'
import {sectionSelectorFamily} from '../state/globalState'
import {useAtomValue} from 'jotai'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  header: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: '20px',
    height: '100px',
    background: `linear-gradient(
      180deg,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0) 100%
    )`,
  },
  link: {
    marginRight: '20px',
  },
  defendersTitle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    margin: '0',
    fontSize: '2.5em',
    fontWeight: 'bold',
    opacity: '0.1',
    letterSpacing: '1.5em',
  },
})

export default function Header() {
  const {pathname} = useLocation()
  const [sectionSlug, episodeSlug] = pathname.slice(1).split('/')
  const section = useAtomValue(sectionSelectorFamily(sectionSlug))
  const showSectionLink = !!section && !!episodeSlug
  const linkCls = stylex.props(styles.link).className

  return (
    <header {...stylex.props(styles.header)}>
      <div>
        {sectionSlug && (
          <Link className={linkCls} to="/">
            All Sections
          </Link>
        )}
        {showSectionLink && (
          <Link className={linkCls} to={`/${section.slug}`}>
            {section.title}
          </Link>
        )}
      </div>
      <div {...stylex.props(styles.defendersTitle)}>DEFENDERS</div>
      <a className="rf-logo" href="https://reasonablefaith.org" target="_blank">
        <img src={rfLogo} alt="Reasonable Faith logo" />
      </a>
    </header>
  )
}
