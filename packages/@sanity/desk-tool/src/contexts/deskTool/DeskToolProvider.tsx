import React, {useMemo} from 'react'
import {DeskToolContextValue} from '../../types'
import {DeskToolContext} from './DeskToolContext'

export function DeskToolProvider({
  children,
  narrow,
}: {
  children?: React.ReactNode
  narrow: boolean
}): React.ReactElement {
  const contextValue: DeskToolContextValue = useMemo(() => ({narrow}), [narrow])

  return <DeskToolContext.Provider value={contextValue}>{children}</DeskToolContext.Provider>
}
