import {MenuItem, MenuItemGroup} from '@sanity/base/__legacy/@sanity/components'
import {SanityDocument} from '@sanity/types'
import {BaseDeskToolPaneProps} from '../types'

export interface DocumentPaneOptions {
  id: string
  type: string
  template?: string
  templateParameters?: Record<string, unknown>
}

export interface DocumentView {
  type: string
  id: string
  title: string
  options: {}
  component: React.ComponentType<any>
  icon?: React.ComponentType<any>
}

export interface DocumentViewType {
  type: string
  id: string
  title: string
  options: {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>
}

export type DocumentPaneProviderProps = BaseDeskToolPaneProps<{
  type: 'document'
  initialValue?: SanityDocument
  menuItems: MenuItem[]
  menuItemGroups: MenuItemGroup[]
  options: DocumentPaneOptions
  title?: string
  views: DocumentViewType[]
}>
