import {Atom, atom} from 'jotai'
import {atomWithDefault, atomFamily, atomWithStorage} from 'jotai/utils'
import deepEqual from 'fast-deep-equal'

import type {DefendersData} from '../../../websiteMiddlewares'

/**
 * This atom queries and returns all the data for Defenders Series 3.
 * There are 14 total sections, each container a number of episodes.
 */
export const sectionsQueryAtom = atomWithDefault<Promise<DefendersData>>(() => {
  return fetch('/defenders/data')
    .then(res => res.json())
    .then((data: DefendersData) => data)
})

/**
 * This selector family returns data for a single section, given a section slug.
 */
export const sectionSelectorFamily = atomFamily<
  string | undefined,
  Atom<Promise<DefendersData[number] | undefined>>
>(sectionSlug => {
  return atom(async get => {
    const data = await get(sectionsQueryAtom)
    return data.find(section => section.slug === sectionSlug)
  })
})

/**
 * This selector family returns the index for a single section (i.e. 4 of 14),
 * given a section slug.
 */
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

/**
 * This selector family returns the data for a single episode of a section,
 * given a section slug and episode slug.
 */
export const episodeSelectorFamily = atomFamily<
  EpisodeSelectorFamilyInputType,
  Atom<Promise<DefendersData[number]['episodes'][number] | undefined>>
>(({sectionSlug, episodeSlug}) => {
  return atom(async get => {
    if (!sectionSlug || !episodeSlug) return undefined

    const section = await get(sectionSelectorFamily(sectionSlug))
    return section?.episodes.find(episode => episode.slug === episodeSlug)
  })
}, deepEqual)

/**
 * This selector family returns the index for a single episode (i.e. 1 of 3),
 * given a section slug and episode slug.
 */
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

/**
 * This selector family returns the number of episodes in a section, given the
 * section slug.
 */
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
type SavedProgressType = Record<string, SavedProgressItem | undefined>
type SavedProgressItem = Record<string, boolean>

/**
 * This atom syncs completed episodes per section in localStorage. This will
 * populate the checkboxes next to each episode on the episode page.
 */
export const savedProgressAtom = atomWithStorage<SavedProgressType>(
  'defendersSavedProgress',
  {}
)

/**
 * This is a write-only atom that updates which episodes are complete in
 * `savedProgressAtom`.
 */
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
    const savedSection = (savedProgressData[sectionSlug] ??= {})
    savedSection[episodeSlug] = true
  } else {
    // Delete the episode in localStorage.
    delete savedProgressData[sectionSlug]?.[episodeSlug]

    // Delete empty sections in localStorage.
    if (!Object.keys(savedProgressData[sectionSlug] ?? {}).length) {
      delete savedProgressData[sectionSlug]
    }
  }

  set(savedProgressAtom, savedProgressData)
})

/**
 * This selector family returns a boolean indicating if a single episode is
 * complete or not, given a section slug and an episode slug.
 */
export const getSavedProgressEpisodeSelectorFamily = atomFamily<
  {sectionSlug: string; episodeSlug: string},
  Atom<boolean>
>(({sectionSlug, episodeSlug}) => {
  return atom(get => {
    const savedProgressData = get(savedProgressAtom)
    return Boolean(savedProgressData[sectionSlug]?.[episodeSlug])
  })
}, deepEqual)

/**
 * This selector family returns a percent of completion for a section, given a
 * section slug.
 */
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
    const num = (completedEpisodes / (sectionData?.episodes.length ?? 0)) * 100

    return Number(num.toFixed(2))
  })
})

/**
 * This write-only atom is used to reset the completion data for a single
 * section, given a section slug.
 */
export const resetSectionAtom = atom(null, (get, set, sectionSlug: string) => {
  const savedProgressData = {...get(savedProgressAtom)}

  delete savedProgressData[sectionSlug]
  set(savedProgressAtom, savedProgressData)
})

/**
 * This write-only atom is used to complete all epsisodes in a section, given a
 * section slug.
 */
export const completeSectionAtom = atom(
  null,
  async (get, set, sectionSlug: string) => {
    const savedProgressData = {...get(savedProgressAtom)}
    const section = await get(sectionSelectorFamily(sectionSlug))
    const episodes = section?.episodes ?? []
    const newSection = {} as SavedProgressItem
    savedProgressData[sectionSlug] = newSection
    episodes.forEach(({slug}) => {
      newSection[slug] = true
    })

    set(savedProgressAtom, savedProgressData)
  }
)

/**
 * This (read-only) selector returns stats used atop the home page.
 */
export const statsSelector = atom(async get => {
  const data = await get(sectionsQueryAtom)
  const savedProgress = get(savedProgressAtom)
  const totalSectionsCount = data.length
  const totalEpisodesCount = data.reduce(
    (acc, {episodes}) => acc + episodes.length,
    0
  )
  const completedSectionsCount = data.reduce((acc, {episodes, slug}) => {
    const sectionProgress = savedProgress[slug]
    if (!sectionProgress) return acc

    const completedEpisodesCount = Object.values(sectionProgress).reduce(
      (acc, val) => acc + Number(val),
      0
    )

    return acc + Number(completedEpisodesCount === episodes.length)
  }, 0)
  const completedEpisodesCount = Object.keys(savedProgress).reduce(
    (acc, item) => {
      const sectionData = savedProgress[item]!!!
      const completedEpisodes = Object.values(sectionData).reduce(
        (acc2, val) => {
          return acc2 + Number(val)
        },
        0
      )
      return acc + completedEpisodes
    },
    0
  )

  return {
    totalSectionsCount,
    completedSectionsCount,
    totalEpisodesCount,
    completedEpisodesCount,
    sectionCompletionPercentage: Number(
      ((completedSectionsCount / totalSectionsCount) * 100).toFixed(2)
    ),
    episodeCompletionPercentage: Number(
      ((completedEpisodesCount / totalEpisodesCount) * 100).toFixed(2)
    ),
  }
})

export const totalSectionTimeSelectorFamily = atomFamily<
  string | undefined,
  Atom<Promise<string>>
>(sectionSlug => {
  return atom(async get => {
    const section = await get(sectionSelectorFamily(sectionSlug))
    if (!section) return ''

    const seconds = section.episodes.reduce((acc, {mp3Duration}) => {
      return acc + mp3Duration
    }, 0)

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    return `${hours ? `${hours}hr ` : ''}${minutes}min`
  })
})
