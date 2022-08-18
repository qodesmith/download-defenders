import {atom, selectorFamily} from 'recoil'
import type {
  DefendersDataType,
  SectionType,
  EpisodeType,
} from '../../../websiteMiddlewares'

export const sectionsQueryAtom = atom<DefendersDataType>({
  key: 'sectionsQueryAtom',
  default: fetch('/defenders/data')
    .then(res => res.json())
    .then((res: {data: DefendersDataType}) => res.data),
})

export const sectionSelectorFamily = selectorFamily<
  SectionType | undefined,
  string | undefined
>({
  key: 'sectionSelectorFamily',
  get:
    sectionSlug =>
    ({get}) => {
      const data = get(sectionsQueryAtom)
      return data.find(section => section.slug === sectionSlug)
    },
})

export const sectionNumberSelectorFamily = selectorFamily<
  number | undefined,
  string | undefined
>({
  key: 'sectionNumberSelectorFamily',
  get:
    sectionSlug =>
    ({get}) => {
      const data = get(sectionsQueryAtom)
      const index = data.findIndex(section => section.slug === sectionSlug)
      return index === -1 ? undefined : index + 1
    },
})

type EpisodeSelectorFamilyInputType = {
  sectionSlug: string | undefined
  episodeSlug: string | undefined
}
export const episodeSelectorFamily = selectorFamily<
  EpisodeType | undefined,
  EpisodeSelectorFamilyInputType
>({
  key: 'episodeSelectorFamily',
  get:
    ({sectionSlug, episodeSlug}) =>
    ({get}) => {
      const section = get(sectionSelectorFamily(sectionSlug))
      return section?.episodes.find(episode => episode.slug === episodeSlug)
    },
})

export const episodeNumberSelectorFamily = selectorFamily<
  number | undefined,
  EpisodeSelectorFamilyInputType
>({
  key: 'episodeNumberSelectorFamily',
  get:
    ({sectionSlug, episodeSlug}) =>
    ({get}) => {
      const section = get(sectionSelectorFamily(sectionSlug))
      const index = section?.episodes.findIndex(
        episode => episode.slug === episodeSlug
      )
      return index === undefined || index === -1 ? undefined : index + 1
    },
})

export const episodesCountSelectorFamily = selectorFamily<
  number | undefined,
  string | undefined
>({
  key: 'episodesCountSelectorFamily',
  get:
    sectionSlug =>
    ({get}) => {
      const section = get(sectionSelectorFamily(sectionSlug))
      return section?.episodes.length
    },
})
