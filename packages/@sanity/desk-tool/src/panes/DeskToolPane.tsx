import React, {useCallback} from 'react'
import {noop} from 'lodash'
import {DocumentsListPane} from './documentsListPane'
import {UserComponentPane} from './userComponentPane'
import {UnknownPane} from './unknownPane'
import {DocumentPaneProvider} from './documentPane'
import {ListPane} from './listPane'

interface DeskToolPaneProps {
  index: number
  title?: string
  type: string
  onCollapse?: (index: number) => void
  onExpand?: (index: number) => void
}

const paneMap = {
  list: ListPane,
  documentList: DocumentsListPane,
  document: DocumentPaneProvider,
  component: UserComponentPane,
}

export function DeskToolPane(props: DeskToolPaneProps) {
  const {index = 0, onCollapse = noop, onExpand = noop, title = '', type} = props

  const handlePaneCollapse = useCallback(() => onCollapse(index), [index, onCollapse])
  const handlePaneExpand = useCallback(() => onExpand(index), [index, onExpand])

  const PaneComponent = paneMap[type] || UnknownPane

  return (
    <PaneComponent
      {...props}
      onExpand={handlePaneExpand}
      onCollapse={handlePaneCollapse}
      title={title}
    />
  )
}
