import React, {useCallback, useMemo} from 'react'
import {sortBy} from 'lodash'
import {Path} from '@sanity/types'
import {ScrollMonitor} from '../../components/scroll'
import {useReportedValues, Reported, TrackedChange} from '../'
import {findMostSpecificTarget} from '../helpers/findMostSpecificTarget'
import {getElementGeometry} from '../helpers/getElementGeometry'
import isChangeBar from '../helpers/isChangeBar'
import scrollIntoView from '../helpers/scrollIntoView'
import {DEBUG_LAYER_BOUNDS} from '../constants'
import {resizeObserver} from '../../util/resizeObserver'
import {Connector} from './Connector'
import {DebugLayers} from './DebugLayers'

import styles from './ConnectorsOverlay.module.css'

export interface Rect {
  height: number
  width: number
  top: number
  left: number
}

interface ConnectorsOverlayProps {
  rootRef: HTMLDivElement
  onSetFocus: (nextFocusPath: Path) => void
}

function useResizeObserver(
  element: HTMLDivElement,
  onResize: (event: ResizeObserverEntry) => void
) {
  React.useEffect(() => resizeObserver.observe(element, onResize), [element, onResize])
}

export function ConnectorsOverlay(props: ConnectorsOverlayProps) {
  const {rootRef, onSetFocus} = props
  const [hovered, setHovered] = React.useState<string | null>(null)
  const allReportedValues = useReportedValues()
  const [, forceUpdate] = React.useReducer((n) => n + 1, 0)
  const byId = useMemo(() => new Map(allReportedValues), [allReportedValues])

  const [changeBarsWithHover, changeBarsWithFocus] = useMemo(() => {
    const _changeBarsWithHover: Reported<TrackedChange>[] = []
    const _changeBarsWithFocus: Reported<TrackedChange>[] = []

    for (const value of allReportedValues) {
      if (!isChangeBar(value) || !value[1].isChanged) {
        continue
      }

      const [id, reportedChangeBar] = value
      if (id === hovered) {
        _changeBarsWithHover.push(value)
        continue
      }

      if (reportedChangeBar.hasHover) {
        _changeBarsWithHover.push(value)
        continue
      }

      if (reportedChangeBar.hasFocus) {
        _changeBarsWithFocus.push(value)
        continue
      }
    }

    return [_changeBarsWithHover, _changeBarsWithFocus]
  }, [allReportedValues, hovered])

  const isHoverConnector = changeBarsWithHover.length > 0
  const changeBarsWithFocusOrHover = isHoverConnector ? changeBarsWithHover : changeBarsWithFocus

  const enabledConnectors = useMemo(
    () =>
      changeBarsWithFocusOrHover
        .map(([id]) => ({
          field: {id, ...findMostSpecificTarget('field', id, byId)},
          change: {id, ...findMostSpecificTarget('change', id, byId)},
        }))
        .filter(({field, change}) => field && change && field.element && change.element)
        .map(({field, change}) => ({
          hasHover: field.hasHover || change.hasHover,
          hasFocus: field.hasFocus,
          hasRevertHover: change.hasRevertHover,
          field: {...field, ...getElementGeometry(field.element, rootRef)},
          change: {...change, ...getElementGeometry(change.element, rootRef)},
        })),
    [byId, changeBarsWithFocusOrHover, rootRef]
  )

  const visibleConnectors = useMemo(
    () => sortBy(enabledConnectors, (c) => -c.field.path.length).slice(0, 1),
    [enabledConnectors]
  )

  useResizeObserver(rootRef, forceUpdate)

  return (
    <ScrollMonitor onScroll={forceUpdate}>
      <svg
        className={styles.svg}
        style={{zIndex: visibleConnectors[0] && visibleConnectors[0].field.zIndex}}
      >
        {visibleConnectors.map(({field, change, hasFocus, hasHover, hasRevertHover}) => {
          if (!change) {
            return null
          }

          return (
            <ConnectorGroup
              field={field}
              change={change}
              hasFocus={hasFocus}
              hasHover={hasHover}
              hasRevertHover={hasRevertHover}
              key={field.id}
              onSetFocus={onSetFocus}
              setHovered={setHovered}
              isHoverConnector={isHoverConnector}
            />
          )
        })}
      </svg>
    </ScrollMonitor>
  )
}

function ConnectorGroup(props: {
  field: TrackedChange & {id: string; rect: Rect; bounds: Rect}
  change: TrackedChange & {id: string; rect: Rect; bounds: Rect}
  hasFocus: boolean
  hasHover: boolean
  hasRevertHover: boolean
  setHovered: (id: string | null) => void
  onSetFocus: (nextFocusPath: Path) => void
  isHoverConnector: boolean
}) {
  const {
    change,
    field,
    hasFocus,
    hasHover,
    hasRevertHover,
    onSetFocus,
    setHovered,
    isHoverConnector,
  } = props

  const onConnectorClick = useCallback(() => {
    scrollIntoView(field)
    scrollIntoView(change)

    onSetFocus(field.path)
  }, [field, change, onSetFocus])

  const handleMouseEnter = useCallback(() => setHovered(field.id), [field, setHovered])
  const handleMouseLeave = useCallback(() => setHovered(null), [setHovered])

  return (
    <>
      <g onClick={onConnectorClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Connector
          from={{rect: field.rect, bounds: field.bounds}}
          to={{rect: change.rect, bounds: change.bounds}}
          focused={hasFocus}
          hovered={hasHover || isHoverConnector}
          revertHovered={hasRevertHover}
        />
      </g>

      {DEBUG_LAYER_BOUNDS && <DebugLayers field={field} change={change} />}
    </>
  )
}
