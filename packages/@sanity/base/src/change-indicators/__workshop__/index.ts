import {defineScope} from '@sanity/ui-workshop'
import {lazy} from 'react'

export default defineScope('base/change-indicators', 'Change indicators', [
  {
    name: 'changebar',
    title: 'ChangeBar',
    component: lazy(() => import('./example')),
  },
])
