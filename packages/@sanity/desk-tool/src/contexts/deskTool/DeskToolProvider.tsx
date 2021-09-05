import React, {useMemo} from 'react'
import {DeskToolContext} from './DeskToolContext'
import {DeskToolContextValue} from './types'

export function DeskToolProvider({
  children,
  layoutCollapsed,
}: {
  children?: React.ReactNode
  layoutCollapsed: boolean
}): React.ReactElement {
  const features = useMemo(
    () => ({
      reviewChanges: !layoutCollapsed,
      splitPanes: !layoutCollapsed,
      splitViews: !layoutCollapsed,
    }),
    [layoutCollapsed]
  )

  const contextValue: DeskToolContextValue = useMemo(() => ({features, layoutCollapsed}), [
    features,
    layoutCollapsed,
  ])

  return <DeskToolContext.Provider value={contextValue}>{children}</DeskToolContext.Provider>
}
