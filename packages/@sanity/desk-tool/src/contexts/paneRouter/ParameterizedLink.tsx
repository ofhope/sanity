// @todo: remove the following line when part imports has been removed from this file
///<reference types="@sanity/types/parts" />

import React, {forwardRef, useContext, useMemo} from 'react'
import {StateLink} from 'part:@sanity/base/router'
import {PaneRouterContext} from './PaneRouterContext'

interface ParameterizedLinkProps {
  params?: Record<string, string>
  payload?: unknown
  children?: React.ReactNode
}

export const ParameterizedLink = forwardRef(function ParameterizedLink(
  props: ParameterizedLinkProps,
  ref: React.Ref<StateLink>
) {
  const {params: newParams, payload: newPayload, ...rest} = props
  const {routerPanesState} = useContext(PaneRouterContext)

  const panes = routerPanesState.map((group, i) => {
    if (i !== routerPanesState.length - 1) {
      return group
    }

    const pane = group[0]
    return [
      {
        ...pane,
        params: newParams || pane.params,
        payload: newPayload || pane.payload,
      },
      ...group.slice(1),
    ]
  })

  const state = useMemo(() => ({panes}), [panes])

  return <StateLink ref={ref} {...rest} state={state} />
})
