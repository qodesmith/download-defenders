import {atom} from 'recoil'

import type {DefendersDataType} from '../../../websiteMiddlewares'

export const sectionsQueryAtom = atom<DefendersDataType>({
  key: 'sectionsQueryAtom',
  default: fetch('/defenders/data')
    .then(res => res.json())
    .then((res: {data: DefendersDataType}) => res.data),
})
