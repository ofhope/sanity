import {omit} from 'lodash'
import {Router} from 'part:@sanity/base/router'
import React, {useMemo} from 'react'
import {exclusiveParams, PaneRouterProvider} from '../_exports'
import {RouterPane, StructurePane} from '../types'
import {DocumentsListPane} from './documentsListPane'
import {UserComponentPane} from './userComponentPane'
import {UnknownPane} from './unknownPane'
import {DocumentPaneProvider} from './documentPane'
import {ListPane} from './listPane'

interface DeskToolPaneProps {
  group: RouterPane[]
  groupIndexes: number[]
  i: number
  index: number
  pane: StructurePane
  paneKeys: string[]
  panes: StructurePane[]
  router: Router
  routerState: {panes: RouterPane[]}
  sibling: RouterPane
  siblingIndex: number
}

const paneMap = {
  list: ListPane,
  documentList: DocumentsListPane,
  document: DocumentPaneProvider,
  component: UserComponentPane,
}

// The same pane might appear multiple times (split pane), so use index as tiebreaker
export function DeskToolPane(props: DeskToolPaneProps) {
  const {
    group,
    groupIndexes,
    i,
    index,
    pane,
    paneKeys,
    panes,
    router,
    routerState,
    sibling,
    siblingIndex,
  } = props
  const groupRoot = group[0]
  const isDuplicate = siblingIndex > 0 && sibling.id === groupRoot.id
  const paneKey = `${i}-${paneKeys[i] || 'root'}-${groupIndexes[i - 1]}`
  const itemId = paneKeys[i]
  const childItemId = paneKeys[i + 1] || ''
  const rootParams = useMemo(() => omit(groupRoot.params || {}, exclusiveParams), [
    groupRoot.params,
  ])
  const params: Record<string, string> = useMemo(
    () => (isDuplicate ? {...rootParams, ...(sibling.params || {})} : sibling.params || {}),
    [isDuplicate, rootParams, sibling.params]
  )
  const payload = isDuplicate ? sibling.payload || groupRoot.payload : sibling.payload
  const isSelected = i === panes.length - 1
  const isActive = i === panes.length - 2
  const isClosable = siblingIndex > 0
  const {type, ...restPane} = pane
  const PaneComponent = paneMap[type] || UnknownPane

  return (
    <PaneRouterProvider
      flatIndex={i}
      index={index}
      params={params}
      payload={payload}
      router={router}
      routerState={routerState}
      siblingIndex={siblingIndex}
    >
      <PaneComponent
        key={paneKey} // Use key to force rerendering pane on ID change
        paneKey={paneKey}
        index={i}
        itemId={itemId}
        urlParams={params}
        childItemId={childItemId}
        isSelected={isSelected}
        isClosable={isClosable}
        isActive={isActive}
        {...restPane}
      />
    </PaneRouterProvider>
  )
}
