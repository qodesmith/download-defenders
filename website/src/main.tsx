import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import {RecoilRoot} from 'recoil'
import './index.css'
import HomePage from './pages/HomePage.js'
import SectionPage from './pages/SectionPage.js'
import EpisodePage from './pages/EpisodePage'
import Header from './components/Header'

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
          <Header />
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
