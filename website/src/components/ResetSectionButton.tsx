import {useSetAtom} from 'jotai'
import {resetSectionAtom} from '../state/globalState'
import {useCallback} from 'react'

type Props = {
  sectionSlug: string
}

export default function ResetSectionButton({sectionSlug}: Props) {
  const resetSection = useSetAtom(resetSectionAtom)
  const handleClick = useCallback(() => resetSection(sectionSlug), [])

  return <button onClick={handleClick}>Reset section</button>
}
