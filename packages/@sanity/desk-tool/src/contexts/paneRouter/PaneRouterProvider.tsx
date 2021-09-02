import React, {useMemo, useCallback} from 'react'
import {pick, omit} from 'lodash'
import {Router} from 'part:@sanity/base/router'
import {PaneRouterContext} from './PaneRouterContext'
import {PaneRouterContextValue, SetParamsOptions} from './types'
import {exclusiveParams} from './constants'
import {ChildLink} from './ChildLink'
import {ParameterizedLink} from './ParameterizedLink'

const DEFAULT_SET_PARAMS_OPTIONS: SetParamsOptions = {
  recurseIfInherited: false,
}

export function PaneRouterProvider(props: {
  children: React.ReactNode
  flatIndex: number
  index: number
  params: Record<string, string>
  payload: unknown
  router: Router
  routerState: any
  siblingIndex: number
}) {
  const {
    children,
    flatIndex,
    index,
    params: paneParams,
    payload: panePayload,
    router,
    routerState,
    siblingIndex,
  } = props

  const routerPanes = useMemo(() => routerState.panes || [], [routerState.panes])

  const groupIndex = index - 1

  const getCurrentGroup = useCallback(() => {
    return (routerPanes[groupIndex] || []).slice()
  }, [groupIndex, routerPanes])

  const modifyCurrentGroup = useCallback(
    (modifier) => {
      const newPanes = routerPanes.slice()
      const group = getCurrentGroup()

      newPanes.splice(groupIndex, 1, modifier(group, group[siblingIndex]))

      const newRouterState = {...routerState, panes: newPanes}

      router.navigate(newRouterState)

      return newRouterState
    },
    [getCurrentGroup, groupIndex, router, routerPanes, routerState, siblingIndex]
  )

  const setPayload: PaneRouterContextValue['setPayload'] = useCallback(
    (nextPayload) => {
      modifyCurrentGroup((siblings, item) => {
        const newGroup = siblings.slice()

        newGroup[siblingIndex] = {...item, payload: nextPayload}

        return newGroup
      })
    },
    [modifyCurrentGroup, siblingIndex]
  )

  const setParams: PaneRouterContextValue['setParams'] = useCallback(
    (nextParams, setOptions = {}) => {
      const {recurseIfInherited} = {...DEFAULT_SET_PARAMS_OPTIONS, ...setOptions}

      modifyCurrentGroup((siblings, item) => {
        const isGroupRoot = siblingIndex === 0
        const isDuplicate = !isGroupRoot && item.id === siblings[0].id
        const newGroup = siblings.slice()

        if (!isDuplicate) {
          newGroup[siblingIndex] = {...item, params: nextParams}
          return newGroup
        }

        const rootParams = siblings[0].params

        if (recurseIfInherited) {
          const newParamKeys = Object.keys(nextParams)
          const inheritedKeys = Object.keys(paneParams).filter(
            (key) => rootParams[key] === paneParams[key]
          )

          const removedInheritedKeys = inheritedKeys.filter((key) => !nextParams[key])
          const remainingInheritedKeys = newParamKeys.filter((key) => inheritedKeys.includes(key))
          const exclusiveKeys = newParamKeys.filter((key) => !inheritedKeys.includes(key))
          const exclusive = pick(nextParams, exclusiveKeys)
          const inherited = {
            ...omit(rootParams, removedInheritedKeys),
            ...pick(nextParams, remainingInheritedKeys),
          }

          newGroup[0] = {...item, params: inherited}
          newGroup[siblingIndex] = {...item, params: exclusive}
        } else {
          // If it's a duplicate of the group root, we should only set the parameters
          // that differ from the group root.
          const newParams = Object.keys(nextParams).reduce((siblingParams, key) => {
            if (exclusiveParams.includes(key) || nextParams[key] !== rootParams[key]) {
              siblingParams[key] = nextParams[key]
            }

            return siblingParams
          }, {})

          newGroup[siblingIndex] = {...item, params: newParams}
        }

        return newGroup
      })
    },
    [modifyCurrentGroup, paneParams, siblingIndex]
  )

  const ctx: PaneRouterContextValue = useMemo(
    () => ({
      // Zero-based index (position) of pane, visually
      index: flatIndex,

      // Zero-based index of pane group (within URL structure)
      groupIndex,

      // Zero-based index of pane within sibling group
      siblingIndex,

      // Payload of the current pane
      payload: panePayload,

      // Params of the current pane
      params: paneParams,

      // Whether or not the pane has any siblings (within the same group)
      hasGroupSiblings: getCurrentGroup().length > 1,

      // The length of the current group
      groupLength: getCurrentGroup().length,

      // Current router state for the "panes" property
      routerPanesState: routerPanes,

      // Curried StateLink that passes the correct state automatically
      ChildLink,

      // Curried StateLink that passed the correct state, but merges params/payload
      ParameterizedLink,

      // Replaces the current pane with a new one
      replaceCurrent: ({id, payload, params} = {}): void => {
        modifyCurrentGroup(() => [{id, payload, params}])
      },

      // Removes the current pane from the group
      closeCurrent: (): void => {
        modifyCurrentGroup((siblings, item) =>
          siblings.length > 1 ? siblings.filter((sibling) => sibling !== item) : siblings
        )
      },

      // Duplicate the current pane, with optional overrides for payload, parameters
      duplicateCurrent: (options): void => {
        const {payload, params} = options || {}
        modifyCurrentGroup((siblings, item) => {
          const newGroup = siblings.slice()
          newGroup.splice(siblingIndex + 1, 0, {
            ...item,
            payload: payload || item.payload,
            params: params || item.params,
          })
          return newGroup
        })
      },

      // Set the view for the current pane
      setView: (viewId) => {
        const {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          view,
          ...rest
        } = paneParams
        return setParams(viewId ? {...rest, view: viewId} : rest)
      },

      // Set the parameters for the current pane
      setParams,

      // Set the payload for the current pane
      setPayload,

      // Proxied navigation to a given intent. Consider just exposing `router` instead?
      navigateIntent: router.navigateIntent,
    }),
    [
      flatIndex,
      getCurrentGroup,
      groupIndex,
      modifyCurrentGroup,
      paneParams,
      panePayload,
      router.navigateIntent,
      routerPanes,
      setParams,
      setPayload,
      siblingIndex,
    ]
  )

  return <PaneRouterContext.Provider value={ctx}>{children}</PaneRouterContext.Provider>
}
