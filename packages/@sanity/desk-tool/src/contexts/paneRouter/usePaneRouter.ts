import {useContext} from 'react'
import {PaneRouterContext} from './PaneRouterContext'
import {PaneRouterContextValue} from './types'

export function usePaneRouter(): PaneRouterContextValue {
  return useContext(PaneRouterContext)
}
