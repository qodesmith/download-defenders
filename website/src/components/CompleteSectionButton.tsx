import {useSetAtom} from 'jotai'
import {completeSectionAtom} from '../state/globalState'
import {useCallback} from 'react'

type Props = {
  sectionSlug: string
}

export default function CompleteSectionButton({sectionSlug}: Props) {
  const completeSection = useSetAtom(completeSectionAtom)
  const handleClick = useCallback(() => completeSection(sectionSlug), [])

  return <button onClick={handleClick}>Complete section</button>
}
