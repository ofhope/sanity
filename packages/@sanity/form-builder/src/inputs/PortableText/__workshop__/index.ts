import {defineScope} from '@sanity/ui-workshop'
import {lazy} from 'react'

export default defineScope('form-builder/inputs/pte', 'Portable Text Editor', [
  {
    name: 'example',
    title: 'Example',
    component: lazy(() => import('./ExampleStory')),
  },
])
