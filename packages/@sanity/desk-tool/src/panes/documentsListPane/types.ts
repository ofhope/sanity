import {SanityDocument} from '@sanity/types'

export interface DocumentsListPaneItem extends SanityDocument {
  hasPublished: boolean
  hasDraft: boolean
}
