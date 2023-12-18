import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './index.css'
import HomePage from './pages/HomePage.js'
import SectionPage from './pages/SectionPage.js'
import EpisodePage from './pages/EpisodePage'
import Header from './components/Header'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <React.Suspense fallback="Loading data...">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path=":section" element={<SectionPage />} />
          <Route path=":section/:episode" element={<EpisodePage />} />
        </Routes>
      </BrowserRouter>
    </React.Suspense>
  </React.StrictMode>
)
