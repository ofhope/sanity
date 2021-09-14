import {defineScope} from '@sanity/ui-workshop'
import {lazy} from 'react'

export default defineScope('form-builder/inputs/pte', 'Portable Text Editor', [
  {
    name: 'default',
    title: 'Default Schema',
    component: lazy(() => import('./DefaultSchemaStory')),
  },
  {
    name: 'custom',
    title: 'Custom Schema',
    component: lazy(() => import('./CustomSchemaStory')),
  },
])
