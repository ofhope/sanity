// @todo: remove the following line when part imports has been removed from this file
///<reference types="@sanity/types/parts" />

import {getTemplateById} from '@sanity/base/initial-value-templates'
import {PortalProvider, useToast} from '@sanity/ui'
import {useRouter, useRouterState} from 'part:@sanity/base/router'
import React, {useState, useEffect, useCallback, useMemo, useRef, Fragment} from 'react'
import {interval, of} from 'rxjs'
import {map, switchMap, distinctUntilChanged, debounce} from 'rxjs/operators'
import {PaneLayout} from './components/pane'
import {StructureError} from './components/StructureError'
import {LOADING_PANE} from './constants'
import {DeskToolProvider} from './contexts/deskTool'
import {
  getIntentRouteParams,
  getPaneDiffIndex,
  getWaitMessages,
  hasLoading,
  isSaveHotkey,
} from './helpers'
import {DeskToolPane, LoadingPane} from './panes'
import {RouterPane, StructureErrorType, StructurePane} from './types'
import {
  resolvePanes,
  loadStructure,
  maybeSerialize,
  setStructureResolveError,
} from './utils/resolvePanes'

interface DeskToolProps {
  onPaneChange: (panes: StructurePane[]) => void
}

const EMPTY_PANE_KEYS: string[] = []

export function DeskTool(props: DeskToolProps) {
  const {onPaneChange} = props
  const {navigate} = useRouter()
  const routerState = useRouterState()
  const routerPanes: RouterPane[][] = useMemo(() => routerState.panes || [], [routerState.panes])
  const {action, legacyEditDocumentId, type: schemaType, editDocumentId, params = {}} = routerState
  const {push: pushToast} = useToast()
  const [resolvedPanes, setResolvedPanes] = useState<StructurePane[]>([])
  const [error, setError] = useState<StructureErrorType | null>(null)
  const prevRouterPanesRef = useRef<RouterPane[][] | null>(null)
  const currRouterPanesRef = useRef<RouterPane[][]>(routerPanes)
  const [layoutCollapsed, setLayoutCollapsed] = useState(false)
  const resolvedPanesRef = useRef(resolvedPanes)

  const structure$ = useMemo(
    () => loadStructure().pipe(distinctUntilChanged(), map(maybeSerialize)),
    []
  )

  const keys: string[] = useMemo(
    () =>
      routerPanes.reduce(
        (ids: string[], group) => ids.concat(group.map((sibling) => sibling.id)),
        []
      ) || EMPTY_PANE_KEYS,
    [routerPanes]
  )

  const groupIndexes: number[] = useMemo(
    () =>
      routerPanes.reduce(
        (ids: number[], group) => ids.concat(group.map((sibling, groupIndex) => groupIndex)),
        []
      ),
    [routerPanes]
  )

  useEffect(() => {
    prevRouterPanesRef.current = currRouterPanesRef.current
    currRouterPanesRef.current = routerPanes
  }, [routerPanes])

  const setResolveError = useCallback((_error: StructureErrorType) => {
    setStructureResolveError(_error)

    // Log error for proper stack traces
    console.error(_error) // eslint-disable-line no-console

    setError(_error)
  }, [])

  const maybeHandleOldUrl = useCallback(() => {
    const {template: templateName, ...payloadParams} = params
    const template = getTemplateById(templateName)
    const type = (template && template.schemaType) || schemaType
    const shouldRewrite = (action === 'edit' && legacyEditDocumentId) || (type && editDocumentId)

    if (!shouldRewrite) {
      return
    }

    navigate(
      getIntentRouteParams({
        id: editDocumentId || legacyEditDocumentId,
        type,
        payloadParams,
        templateName,
      }),
      {replace: true}
    )
  }, [action, editDocumentId, legacyEditDocumentId, navigate, params, schemaType])

  const maybePruneSiblingPanes = useCallback(() => {
    if (!layoutCollapsed) {
      return
    }

    const hasSiblings = routerPanes.some((group) => group.length > 1)

    if (!hasSiblings) {
      return
    }

    const withoutSiblings = routerPanes.map((group) => [group[0]])

    navigate({panes: withoutSiblings}, {replace: true})
  }, [navigate, layoutCollapsed, routerPanes])

  useEffect(maybePruneSiblingPanes, [maybePruneSiblingPanes])
  useEffect(maybeHandleOldUrl, [maybeHandleOldUrl])

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Prevent `Cmd+S`
      if (isSaveHotkey(event)) {
        event.preventDefault()

        pushToast({
          closable: true,
          id: 'auto-save-message',
          status: 'info',
          title: 'Sanity auto-saves your work!',
          duration: 4000,
        })
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [pushToast])

  useEffect(() => {
    const _resolvedPanes = resolvedPanesRef.current
    const prevPanes = prevRouterPanesRef.current
    const nextPanes = currRouterPanesRef.current
    const fromIndex = getPaneDiffIndex(nextPanes, prevPanes) || [0, 0]

    const resolvedPanes$ = structure$.pipe(
      switchMap((structure) => resolvePanes(structure, routerPanes, _resolvedPanes, fromIndex)),
      switchMap((_panes) =>
        hasLoading(_panes) ? of(_panes).pipe(debounce(() => interval(50))) : of(_panes)
      )
    )

    const sub = resolvedPanes$.subscribe({
      next(value) {
        setResolvedPanes(value)
        resolvedPanesRef.current = value
      },
      error(err) {
        setResolveError(err)
      },
    })

    return () => sub.unsubscribe()
  }, [routerPanes, setResolveError, setResolvedPanes, structure$])

  useEffect(() => {
    onPaneChange(resolvedPanes)
  }, [onPaneChange, resolvedPanes])

  const [portalElement, setPortalElement] = useState<HTMLDivElement | null>(null)
  const paneKeys = useMemo(() => ['root'].concat(keys), [keys])
  const paneGroups: RouterPane[][] = useMemo(
    () => [[{id: 'root', params: {}}]].concat(routerPanes || []),
    [routerPanes]
  )

  const handleRootCollapse = useCallback(() => setLayoutCollapsed(true), [])

  const handleRootExpand = useCallback(() => setLayoutCollapsed(false), [])

  if (error) {
    return <StructureError error={error} />
  }

  if (resolvedPanes.length === 0) {
    return null
  }

  let i = -1
  let path: string[] = []

  return (
    <DeskToolProvider narrow={layoutCollapsed}>
      <PortalProvider element={portalElement || null}>
        <PaneLayout
          flex={1}
          height={layoutCollapsed ? undefined : 'fill'}
          minWidth={512}
          onCollapse={handleRootCollapse}
          onExpand={handleRootExpand}
          style={{minHeight: '100%', minWidth: 320}}
        >
          {paneGroups.map((group, groupIndex) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <Fragment key={groupIndex}>
                {group.map((sibling, siblingIndex) => {
                  const pane = resolvedPanes[++i]

                  if (!pane) {
                    return null
                  }

                  const wrapperKey = pane === LOADING_PANE ? `loading-${i}` : `${i}-${pane.id}`

                  path = path.concat([pane.id || `[${i}]`])

                  if (pane === LOADING_PANE) {
                    return (
                      <LoadingPane
                        key={wrapperKey}
                        path={path}
                        index={i}
                        message={getWaitMessages}
                        isSelected={i === resolvedPanes.length - 1}
                      />
                    )
                  }

                  return (
                    <DeskToolPane
                      group={group}
                      groupIndexes={groupIndexes}
                      i={i}
                      index={groupIndex}
                      key={wrapperKey}
                      pane={pane}
                      paneKeys={paneKeys}
                      panes={resolvedPanes}
                      sibling={sibling}
                      siblingIndex={siblingIndex}
                    />
                  )
                })}
              </Fragment>
            )
          })}
        </PaneLayout>
        <div data-portal="" ref={setPortalElement} />
      </PortalProvider>
    </DeskToolProvider>
  )
}
