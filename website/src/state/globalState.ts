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
    (slug: string | undefined) =>
    ({get}) => {
      const data = get(sectionsQueryAtom)
      return data.find(section => section.slug === slug)
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
    ({
      sectionSlug,
      episodeSlug,
    }: {
      sectionSlug: string | undefined
      episodeSlug: string | undefined
    }) =>
    ({get}) => {
      const section = get(sectionSelectorFamily(sectionSlug))
      return section?.episodes.find(episode => episode.slug === episodeSlug)
    },
})
