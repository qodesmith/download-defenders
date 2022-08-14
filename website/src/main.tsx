import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import {RecoilRoot} from 'recoil'
import HomePage from './pages/HomePage.js'
import './index.css'

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
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      </React.Suspense>
    </RecoilRoot>
  </React.StrictMode>
)
