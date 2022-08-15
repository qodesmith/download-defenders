import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import {RecoilRoot} from 'recoil'
import styled from 'styled-components'
import './index.css'
import rfLogo from './assets/rf-logo.png'
import HomePage from './pages/HomePage.js'
import SectionPage from './pages/SectionPage.js'
import EpisodePage from './pages/EpisodePage'

const Header = styled.header<{height: string}>`
  position: fixed;
  top: 0;
  left: 0;
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
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RecoilRoot>
      {/*
        Suspense is needed here because we initialize the app with a Recoil
        Atom that fetches the data. Data fetching only happens once in the app.
        Without this suspense, we would get the dreaded error
        "Can't perform a React state update on an unmounted component..."
      */}
      <React.Suspense fallback={null}>
        <BrowserRouter>
          <Header height="100px">
            <a
              className="rf-logo"
              href="https://reasonablefaith.org"
              target="_blank">
              <img src={rfLogo} alt="Reasonable Faith logo" />
            </a>
          </Header>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path=":section" element={<SectionPage />} />
            <Route path=":section/:episode" element={<EpisodePage />} />
          </Routes>
        </BrowserRouter>
      </React.Suspense>
    </RecoilRoot>
  </React.StrictMode>
)
