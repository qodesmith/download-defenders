import {useParams} from 'react-router-dom'
import {useRecoilValue} from 'recoil'
import {sectionSelectorFamily} from '../state/globalState'

export default function SectionPage() {
  const {section: slug} = useParams()
  const section = useRecoilValue(sectionSelectorFamily(slug))

  console.log(section)

  return <div>Section Page - {slug}</div>
}
