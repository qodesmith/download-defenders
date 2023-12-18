import {Atom, atom} from 'jotai'
import {atomWithDefault, atomFamily} from 'jotai/utils'
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
