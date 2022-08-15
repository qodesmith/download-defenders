// import type {RecoilValueReadOnly} from 'recoil'

import {atom, selectorFamily} from 'recoil'
import type {DefendersDataType, SectionType} from '../../../websiteMiddlewares'

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
    (slug: string) =>
    ({get}) => {
      if (!slug) return
      const data = get(sectionsQueryAtom)
      return data.find(section => section.slug === slug)
    },
})
