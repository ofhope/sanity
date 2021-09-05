// @todo: remove the following line when part imports has been removed from this file
///<reference types="@sanity/types/parts" />

import React, {forwardRef, useContext, useMemo} from 'react'
import {StateLink} from 'part:@sanity/base/router'
import {PaneRouterContext} from './PaneRouterContext'

interface BackLinkProps {
  children?: React.ReactNode
}

export const BackLink = forwardRef(function BackLink(
  props: BackLinkProps,
  ref: React.Ref<typeof StateLink>
) {
  const {routerPanesState, groupIndex} = useContext(PaneRouterContext)
  const panes = useMemo(() => routerPanesState.slice(0, groupIndex), [groupIndex, routerPanesState])
  const state = useMemo(() => ({panes}), [panes])

  return <StateLink {...props} ref={ref} state={state} />
})
