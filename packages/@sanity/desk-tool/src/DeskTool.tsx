import isHotkey from 'is-hotkey'
import React from 'react'
import PropTypes from 'prop-types'
import {isEqual} from 'lodash'
import {interval, of, Subscription} from 'rxjs'
import {map, switchMap, distinctUntilChanged, debounce} from 'rxjs/operators'
import shallowEquals from 'shallow-equals'
import {HOCRouter, withRouterHOC} from 'part:@sanity/base/router'
import {getTemplateById} from '@sanity/base/initial-value-templates'
import {
  resolvePanes,
  loadStructure,
  maybeSerialize,
  setStructureResolveError,
} from '../utils/resolvePanes'
import {StructureError} from '../components/StructureError'
import {calculatePanesEquality} from '../utils/calculatePanesEquality'
import isNarrowScreen from '../utils/isNarrowScreen'
import windowWidth$ from '../utils/windowWidth'
import {LOADING_PANE} from '../constants'
import DeskToolPanes from './DeskToolPanes'

interface StructureErrorType {
  message: string
  stack: string
  path?: Array<string | number>
  helpId?: string
}

interface DeskToolProps {
  router: HOCRouter
  onPaneChange: (panes: any) => void
}

interface DeskToolState {
  isResolving: boolean
  hasNarrowScreen: boolean
  panes: any
  error?: StructureErrorType
}

const EMPTY_PANE_KEYS: string[] = []

const hasLoading = (panes: any) => panes.some((item) => item === LOADING_PANE)

const isSaveHotkey = isHotkey('mod+s')

export default withRouterHOC(
  class DeskTool extends React.Component<DeskToolProps, DeskToolState> {
    static contextTypes = {
      addToSnackQueue: PropTypes.func,
    }

    paneDeriver: Subscription | null = null
    resizeSubscriber: Subscription | null = null

    state: DeskToolState = {
      // eslint-disable-next-line react/no-unused-state
      isResolving: true,
      hasNarrowScreen: isNarrowScreen(),
      panes: null,
    }

    constructor(props: DeskToolProps) {
      super(props)

      props.onPaneChange([])
    }

    setResolvedPanes = (panes: any) => {
      const router = this.props.router
      const routerPanes = router.state.panes || []

      this.setState({
        panes,
        // eslint-disable-next-line react/no-unused-state
        isResolving: false,
      })

      if (panes.length < routerPanes.length) {
        router.navigate(
          {...router.state, panes: routerPanes.slice(0, panes.length)},
          {replace: true}
        )
      }
    }

    setResolveError = (error: StructureErrorType) => {
      setStructureResolveError(error)

      // Log error for proper stacktraces
      console.error(error) // eslint-disable-line no-console

      this.setState({
        error,
        // eslint-disable-next-line react/no-unused-state
        isResolving: false,
      })
    }

    derivePanes(props: DeskToolProps, fromIndex: [number, number] = [0, 0]) {
      if (this.paneDeriver) {
        this.paneDeriver.unsubscribe()
      }

      this.setState({
        // eslint-disable-next-line react/no-unused-state
        isResolving: true,
      })

      this.paneDeriver = loadStructure()
        .pipe(
          distinctUntilChanged(),
          map(maybeSerialize),
          switchMap((structure: any) =>
            resolvePanes(structure, props.router.state.panes || [], this.state.panes, fromIndex)
          ),
          switchMap((panes: any) =>
            hasLoading(panes) ? of(panes).pipe(debounce(() => interval(50))) : of(panes)
          )
        )
        .subscribe(this.setResolvedPanes, this.setResolveError)
    }

    panesAreEqual = (prev: any, next: any) => {
      return calculatePanesEquality(prev, next).ids
    }

    shouldDerivePanes = (nextProps: DeskToolProps, prevProps: DeskToolProps) => {
      const nextRouterState = nextProps.router.state
      const prevRouterState = prevProps.router.state

      return (
        !this.panesAreEqual(prevRouterState.panes, nextRouterState.panes) ||
        nextRouterState.legacyEditDocumentId !== prevRouterState.legacyEditDocumentId ||
        nextRouterState.type !== prevRouterState.type ||
        nextRouterState.action !== prevRouterState.action
      )
    }

    componentDidUpdate(prevProps: DeskToolProps, prevState: DeskToolState) {
      if (
        prevProps.onPaneChange !== this.props.onPaneChange ||
        prevState.panes !== this.state.panes
      ) {
        this.props.onPaneChange(this.state.panes || [])
      }

      const prevPanes = prevProps.router.state.panes || []
      const nextPanes = this.props.router.state.panes || []
      const panesEqual = calculatePanesEquality(prevPanes, nextPanes)

      if (!panesEqual.ids && this.shouldDerivePanes(this.props, prevProps)) {
        const diffAt = getPaneDiffIndex(nextPanes, prevPanes)

        if (diffAt) {
          this.derivePanes(this.props, diffAt)
        }
      }
    }

    shouldComponentUpdate(nextProps: DeskToolProps, nextState: DeskToolState) {
      const {router: oldRouter, ...oldProps} = this.props
      const {router: newRouter, ...newProps} = nextProps
      const {panes: oldPanes, ...oldState} = this.state
      const {panes: newPanes, ...newState} = nextState
      const prevPanes = oldRouter.state.panes || []
      const nextPanes = newRouter.state.panes || []
      const panesEqual = calculatePanesEquality(prevPanes, nextPanes)

      const shouldUpdate =
        !panesEqual.params ||
        !panesEqual.ids ||
        !shallowEquals(oldProps, newProps) ||
        !isEqual(oldPanes, newPanes) ||
        !shallowEquals(oldState, newState)

      return shouldUpdate
    }

    maybeHandleOldUrl() {
      const {navigate} = this.props.router
      const {
        action,
        legacyEditDocumentId,
        type: schemaType,
        editDocumentId,
        params = {},
      } = this.props.router.state

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
    }

    maybeCutSiblingPanes() {
      const {hasNarrowScreen} = this.state
      if (!hasNarrowScreen) {
        return
      }

      const {navigate} = this.props.router
      const panes: unknown[][] = this.props.router.state.panes || []
      const hasSiblings = panes.some((group) => group.length > 1)
      if (!hasSiblings) {
        return
      }

      const withoutSiblings = panes.map((group) => [group[0]])
      navigate({panes: withoutSiblings}, {replace: true})
    }

    componentDidMount() {
      this.resizeSubscriber = windowWidth$.subscribe(() => {
        const hasNarrowScreen = isNarrowScreen()
        if (this.state.hasNarrowScreen !== hasNarrowScreen) {
          this.setState({hasNarrowScreen: isNarrowScreen()}, this.maybeCutSiblingPanes)
        }
      })

      this.maybeCutSiblingPanes()
      this.maybeHandleOldUrl()
      this.derivePanes(this.props)
      this.props.onPaneChange(this.state.panes || [])

      window.addEventListener('keydown', this.handleGlobalKeyDown)
    }

    componentWillUnmount() {
      if (this.paneDeriver) {
        this.paneDeriver.unsubscribe()
      }

      if (this.resizeSubscriber) {
        this.resizeSubscriber.unsubscribe()
      }

      window.removeEventListener('keydown', this.handleGlobalKeyDown)
    }

    handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Prevent `Cmd+S`
      if (isSaveHotkey(event)) {
        event.preventDefault()

        this.context.addToSnackQueue({
          id: 'auto-save-message',
          isOpen: true,
          setFocus: false,
          kind: 'info',
          title: 'Sanity auto-saves your work!',
          autoDismissTimeout: 4000,
          isCloseable: true,
        })
      }
    }

    render() {
      const {router} = this.props
      const {panes, error} = this.state
      if (error) {
        return <StructureError error={error} />
      }

      const routerPanes = router.state.panes || []

      const keys: string[] =
        routerPanes.reduce(
          (ids: string[], group) => ids.concat(group.map((sibling) => sibling.id)),
          []
        ) || EMPTY_PANE_KEYS

      const groupIndexes: number[] = routerPanes.reduce(
        (ids: number[], group) => ids.concat(group.map((sibling, groupIndex) => groupIndex)),
        []
      )

      if (!panes) {
        return null
      }

      return (
        <DeskToolPanes
          router={router}
          panes={panes}
          keys={keys}
          groupIndexes={groupIndexes}
          autoCollapse
        />
      )
    }
  }
)

function getPaneDiffIndex(nextPanes: any, prevPanes: any): [number, number] | undefined {
  if (!nextPanes.length) {
    return [0, 0]
  }

  const maxPanes = Math.max(nextPanes.length, prevPanes.length)
  for (let index = 0; index < maxPanes; index++) {
    const nextGroup = nextPanes[index]
    const prevGroup = prevPanes[index]

    // Whole group is now invalid
    if (!prevGroup || !nextGroup) {
      return [index, 0]
    }

    // Less panes than previously? Resolve whole group
    if (prevGroup.length > nextGroup.length) {
      return [index, 0]
    }

    /* eslint-disable max-depth */
    // Iterate over siblings
    for (let splitIndex = 0; splitIndex < nextGroup.length; splitIndex++) {
      const nextSibling = nextGroup[splitIndex]
      const prevSibling = prevGroup[splitIndex]

      // Didn't have a sibling here previously, diff from here!
      if (!prevSibling) {
        return [index, splitIndex]
      }

      // Does the ID differ from the previous?
      if (nextSibling.id !== prevSibling.id) {
        return [index, splitIndex]
      }
    }
    /* eslint-enable max-depth */
  }

  // "No diff"
  return undefined
}

function getIntentRouteParams({id, type, payloadParams, templateName}) {
  return {
    intent: 'edit',
    params: {
      id,
      ...(type ? {type} : {}),
      ...(templateName ? {template: templateName} : {}),
    },
    payload: Object.keys(payloadParams).length > 0 ? payloadParams : undefined,
  }
}
