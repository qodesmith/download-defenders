import {useAtomValue, useSetAtom} from 'jotai'
import {
  getSavedProgressEpisodeSelectorFamily,
  updateEpisodeCompletionAtom,
} from '../state/globalState'
import {useCallback} from 'react'

type Props = {
  id: string
  sectionSlug?: string
  episodeSlug?: string
}

export default function EpisodeCheckbox({id, sectionSlug, episodeSlug}: Props) {
  const isChecked = useAtomValue(
    getSavedProgressEpisodeSelectorFamily({
      sectionSlug: sectionSlug ?? '',
      episodeSlug: episodeSlug ?? '',
    })
  )
  const updateEpisodeCompletion = useSetAtom(updateEpisodeCompletionAtom)
  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!sectionSlug || !episodeSlug) return

      updateEpisodeCompletion({
        sectionSlug,
        episodeSlug: episodeSlug,
        isComplete: e.target.checked,
      })
    },
    []
  )

  return (
    <input
      id={id}
      type="checkbox"
      checked={isChecked}
      onChange={handleCheckboxChange}
    />
  )
}
