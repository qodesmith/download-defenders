import {Atom, atom} from 'jotai'
import {atomWithDefault, atomFamily, atomWithStorage} from 'jotai/utils'
import deepEqual from 'fast-deep-equal'

import type {
  DefendersDataType,
  SectionType,
  EpisodeType,
} from '../../../websiteMiddlewares'

export const sectionsQueryAtom = atomWithDefault<Promise<DefendersDataType>>(
  () => {
    return fetch('/defenders/data')
      .then(res => res.json())
      .then((res: {data: DefendersDataType}) => res.data)
  }
)

export const sectionSelectorFamily = atomFamily<
  string | undefined,
  Atom<Promise<SectionType | undefined>>
>(sectionSlug => {
  return atom(async get => {
    const data = await get(sectionsQueryAtom)
    return data.find(section => section.slug === sectionSlug)
  })
})

export const sectionNumberSelectorFamily = atomFamily<
  string | undefined,
  Atom<Promise<number | undefined>>
>(sectionSlug => {
  return atom(async get => {
    const data = await get(sectionsQueryAtom)
    const index = data.findIndex(section => section.slug === sectionSlug)
    return index === -1 ? undefined : index + 1
  })
})

type EpisodeSelectorFamilyInputType = {
  sectionSlug: string | undefined
  episodeSlug: string | undefined
}

export const episodeSelectorFamily = atomFamily<
  EpisodeSelectorFamilyInputType,
  Atom<Promise<EpisodeType | undefined>>
>(({sectionSlug, episodeSlug}) => {
  return atom(async get => {
    if (!sectionSlug || !episodeSlug) return undefined

    const section = await get(sectionSelectorFamily(sectionSlug))
    return section?.episodes.find(episode => episode.slug === episodeSlug)
  })
}, deepEqual)

export const episodeNumberSelectorFamily = atomFamily<
  EpisodeSelectorFamilyInputType,
  Atom<Promise<number | undefined>>
>(({sectionSlug, episodeSlug}) => {
  return atom(async get => {
    if (!sectionSlug || !episodeSlug) return undefined

    const section = await get(sectionSelectorFamily(sectionSlug))
    const index = section?.episodes.findIndex(
      episode => episode.slug === episodeSlug
    )
    return index === undefined || index === -1 ? undefined : index + 1
  })
}, deepEqual)

export const episodesCountSelectorFamily = atomFamily<
  string | undefined,
  Atom<Promise<number | undefined>>
>(sectionSlug => {
  return atom(async get => {
    if (!sectionSlug) return undefined

    const section = await get(sectionSelectorFamily(sectionSlug))
    return section?.episodes.length
  })
})

/*
  Example:
  {
    [sectionSlug]: {[episode1Slug]: true, [episode2Slug]: true, ...},
    ...
  }
*/
type SavedProgressType = Record<string, Record<string, boolean>>
export const savedProgressAtom = atomWithStorage<SavedProgressType>(
  'defendersSavedProgress',
  {}
)

export const updateEpisodeCompletionAtom = atom<
  null,
  [{sectionSlug: string; episodeSlug: string; isComplete: boolean}],
  void
>(null, (get, set, {sectionSlug, episodeSlug, isComplete}) => {
  /**
   * MUST spread object here! Otherwise, referential equality prevents the
   * necessary re-render when values inside the object change.
   */
  const savedProgressData = {...get(savedProgressAtom)}

  if (isComplete) {
    savedProgressData[sectionSlug] ??= {}
    savedProgressData[sectionSlug][episodeSlug] = true
  } else {
    // Delete the episode in localStorage.
    delete savedProgressData[sectionSlug][episodeSlug]

    // Delete empty sections in localStorage.
    if (!Object.keys(savedProgressData[sectionSlug]).length) {
      delete savedProgressData[sectionSlug]
    }
  }

  set(savedProgressAtom, savedProgressData)
})

export const getSavedProgressEpisodeSelectorFamily = atomFamily<
  {sectionSlug: string; episodeSlug: string},
  Atom<boolean>
>(({sectionSlug, episodeSlug}) => {
  return atom(get => {
    const savedProgressData = get(savedProgressAtom)
    return Boolean(savedProgressData[sectionSlug]?.[episodeSlug])
  })
}, deepEqual)

export const getSavedProgressPercentSelectorFamily = atomFamily<
  string,
  Atom<Promise<number>>
>(sectionSlug => {
  return atom(async get => {
    const savedProgressData = get(savedProgressAtom)
    const sectionData = await get(sectionSelectorFamily(sectionSlug))
    const sectionLocalStorage = savedProgressData[sectionSlug] ?? {}
    const completedEpisodes = Object.values(sectionLocalStorage).reduce(
      (acc, bool) => {
        return acc + Number(bool)
      },
      0
    )

    return (completedEpisodes / (sectionData?.episodes.length ?? 0)) * 100
  })
})

export const resetSectionAtom = atom(null, (get, set, sectionSlug: string) => {
  const savedProgressData = {...get(savedProgressAtom)}

  delete savedProgressData[sectionSlug]
  set(savedProgressAtom, savedProgressData)
})
