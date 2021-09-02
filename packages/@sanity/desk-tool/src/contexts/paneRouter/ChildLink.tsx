import React, {forwardRef, useContext, useMemo} from 'react'
import {StateLink} from 'part:@sanity/base/router'
import {PaneRouterContext} from './PaneRouterContext'

interface ChildLinkProps {
  childId: string
  childPayload?: unknown
  children?: React.ReactNode
}

export const ChildLink = forwardRef(function ChildLink(
  props: ChildLinkProps,
  ref: React.Ref<typeof StateLink>
) {
  const {childId, childPayload, ...rest} = props
  const {routerPanesState, groupIndex} = useContext(PaneRouterContext)
  const panes = useMemo(
    () =>
      routerPanesState.slice(0, groupIndex + 1).concat([[{id: childId, payload: childPayload}]]),
    [childId, childPayload, groupIndex, routerPanesState]
  )

  const state = useMemo(() => ({panes}), [panes])

  return <StateLink {...rest} ref={ref} state={state} />
})
