import type {DefendersDataType} from '../../websiteMiddlewares.js'

import rfLogo from './assets/rf-logo.png'
import styled from 'styled-components'
import {useEffect, useRef, useState} from 'react'
import Section from './Section.js'

export default function App() {
  const [data, setData] = useState<DefendersDataType>()
  const fetched = useRef(false)

  useEffect(() => {
    if (!fetched.current) {
      fetched.current = true
      fetch('/defenders/data')
        .then(res => res.json())
        .then(res => {
          console.log(res)
          setData(res.data)
        })
    }
  }, [])

  return (
    <>
      <Header height="100px">
        <a href="https://reasonablefaith.org" target="_blank">
          <img src={rfLogo} alt="Reasonable Faith logo" />
        </a>
      </Header>
      <Sections>
        {data?.map((section, i) => (
          <Section key={section.sectionName} section={section} num={i + 1} />
        ))}
      </Sections>
    </>
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

const Sections = styled.div`
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
  gap: 20px;
  padding-top: 20px;
`
