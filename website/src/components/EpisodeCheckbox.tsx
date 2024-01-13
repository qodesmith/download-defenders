import {useAtomValue, useSetAtom} from 'jotai'
import {
  getSavedProgressEpisodeSelectorFamily,
  updateEpisodeCompletionAtom,
} from '../state/globalState'
import {useCallback} from 'react'
import * as stylex from '@stylexjs/stylex'
import type {StyleXStyles} from '@stylexjs/stylex'

type Props = {
  id: string
  sectionSlug?: string
  episodeSlug?: string
  styles?: StyleXStyles
}

export default function EpisodeCheckbox({
  id,
  sectionSlug,
  episodeSlug,
  styles,
}: Props) {
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
      {...stylex.props(styles)}
    />
  )
}
