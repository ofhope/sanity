/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react/jsx-filename-extension, react/prop-types */

import React from 'react'
import {omit, sumBy} from 'lodash'
import {merge, of} from 'rxjs'
import {mapTo, delay, distinctUntilChanged} from 'rxjs/operators'
import SplitController from 'part:@sanity/components/panes/split-controller'
import SplitPaneWrapper from 'part:@sanity/components/panes/split-pane-wrapper'
import {resizeObserver} from '@sanity/base/_internal'
import {PortalProvider, rem} from '@sanity/ui'
import styled from 'styled-components'
import {DeskToolPane, LoadingPane} from '../panes'
import windowWidth$ from '../utils/windowWidth'
import isNarrowScreen from '../utils/isNarrowScreen'
import {LOADING_PANE} from '../constants'
import {
  PaneRouterContext,
  getPaneRouterContextFactory,
  exclusiveParams,
} from '../contexts/PaneRouterContext'

const Root = styled.div`
  position: relative;
  height: 100%;

  @media (min-width: ${({theme}) => rem(theme.sanity.media[2])}) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
`

const COLLAPSED_WIDTH = 49

function getPaneMinSize(pane) {
  return pane.type === 'document' ? 668 : 320
}

function getPaneDefaultSize(pane) {
  return pane.type === 'document' ? 668 : 350
}

function getWaitMessages(path) {
  const thresholds = [
    {ms: 300, message: 'Loading…'},
    {ms: 5000, message: 'Still loading…'},
  ]

  if (__DEV__) {
    const message = [
      'Check console for errors?',
      'Is your observable/promise resolving?',
      path.length > 0 ? `Structure path: ${path.join(' ➝ ')}` : '',
    ]

    thresholds.push({
      ms: 10000,
      message: message.join('\n'),
    })
  }

  const src = of(null)
  return merge(...thresholds.map(({ms, message}) => src.pipe(mapTo(message), delay(ms))))
}

// eslint-disable-next-line react/require-optimization
export default class DeskToolPanes extends React.Component {
  static defaultProps = {
    autoCollapse: false,
  }

  _rootElement = React.createRef()

  state = {
    collapsedPanes: [],
    hasNarrowScreen: isNarrowScreen(),
    width: undefined,
  }

  userCollapsedPanes = []

  getPaneRouterContext = getPaneRouterContextFactory(this)

  componentDidUpdate(prevProps) {
    if (this.props.panes.length !== prevProps.panes.length) {
      this.userCollapsedPanes = []
      this.handleAutoCollapse(this.state.width, undefined, this.userCollapsedPanes)
    }

    // Expand new panes
    const paneToForceExpand = this.props.panes.reduce((acc, pane, i) => {
      return prevProps.panes[i] === pane ? acc : i
    }, undefined)

    if (typeof paneToForceExpand !== 'undefined') {
      this.handleAutoCollapse(this.state.width, paneToForceExpand, this.userCollapsedPanes)
    }
  }

  componentDidMount() {
    const {autoCollapse, panes} = this.props
    if (autoCollapse) {
      this.windowResizeSubscriber = windowWidth$.pipe(distinctUntilChanged()).subscribe(() => {
        this.setState({
          hasNarrowScreen: isNarrowScreen(),
        })
      })

      if (this._rootElement && this._rootElement.current) {
        this.unobserveRootElementResize = resizeObserver.observe(
          this._rootElement.current,
          this.handleResize
        )
      }

      if (this.state.width) {
        this.handleAutoCollapse(this.state.width, panes.length - 1, this.userCollapsedPanes)
      }
    }
  }

  handleResize = (event) => {
    const width = event.contentRect.width
    this.setState({width})
    this.handleAutoCollapse(width, undefined, this.userCollapsedPanes)
  }

  componentWillUnmount() {
    if (this.unobserveRootElementResize) {
      this.unobserveRootElementResize()
    }
    if (this.resizeObserver && this._rootElement && this._rootElement.current) {
      this.resizeObserver.unobserve(this._rootElement.current)
    }
  }

  handlePaneCollapse = (index) => {
    if (this.state.hasNarrowScreen || this.props.panes.length === 1) {
      return
    }
    this.userCollapsedPanes[index] = true
    this.handleAutoCollapse(this.state.width, undefined, this.userCollapsedPanes)
  }

  handlePaneExpand = (index) => {
    if (this.state.hasNarrowScreen || this.props.panes.length === 1) {
      return
    }
    this.userCollapsedPanes[index] = false
    this.handleAutoCollapse(this.state.width, index, this.userCollapsedPanes)
  }

  handleAutoCollapse = (width, paneWantExpand, userCollapsedPanes = []) => {
    const {autoCollapse, panes} = this.props
    const {hasNarrowScreen} = this.state
    const paneToForceExpand = typeof paneWantExpand === 'number' ? paneWantExpand : panes.length - 1
    if (hasNarrowScreen || !autoCollapse || !panes || panes.length === 0) {
      return
    }

    const autoCollapsedPanes = []

    const totalMinSize = sumBy(panes, (pane) => getPaneMinSize(pane))
    let remainingMinSize = totalMinSize

    remainingMinSize -= getPaneMinSize(panes[paneToForceExpand])
    autoCollapsedPanes[paneToForceExpand] = false
    userCollapsedPanes[paneToForceExpand] = false

    if (totalMinSize > width) {
      panes.forEach((pane, i) => {
        if (paneToForceExpand != i) {
          if (remainingMinSize > width - getPaneMinSize(panes[paneToForceExpand])) {
            autoCollapsedPanes[i] = true
            remainingMinSize -= getPaneMinSize(pane) - COLLAPSED_WIDTH
          }
        }
      })
    }

    // Respect userCollapsed before autoCollapsed
    const collapsedPanes = panes.map((pane, i) => userCollapsedPanes[i] || autoCollapsedPanes[i])
    this.setState({collapsedPanes})
  }

  renderPanes() {
    const {panes, groupIndexes, keys, router} = this.props
    const {panes: routerPanes} = router.state
    const {hasNarrowScreen} = this.state
    const path = []

    const paneKeys = ['root'].concat(keys)
    const paneGroups = [[{id: 'root'}]].concat(routerPanes || [])

    let i = -1
    return paneGroups.reduce((components, group, index) => {
      return components.concat(
        // eslint-disable-next-line complexity
        group.map((sibling, siblingIndex) => {
          const groupRoot = group[0]
          const isDuplicate = siblingIndex > 0 && sibling.id === groupRoot.id
          const pane = panes[++i]
          if (!pane) {
            return null
          }

          const isCollapsed = Boolean(!hasNarrowScreen && this.state.collapsedPanes[i])
          const paneKey = `${i}-${paneKeys[i] || 'root'}-${groupIndexes[i - 1]}`

          const itemId = paneKeys[i]
          const childItemId = paneKeys[i + 1] || ''

          // Same pane might appear multiple times, so use index as tiebreaker
          const wrapperKey = pane === LOADING_PANE ? `loading-${i}` : `${i}-${pane.id}`
          path.push(pane.id || `[${i}]`)

          const rootParams = omit(groupRoot.params || {}, exclusiveParams)
          const params = isDuplicate ? {...rootParams, ...sibling.params} : sibling.params
          const payload = isDuplicate ? sibling.payload || groupRoot.payload : sibling.payload

          const paneRouterContext = this.getPaneRouterContext({
            groupIndex: index - 1,
            siblingIndex,
            flatIndex: i,
            params,
            payload,
          })

          return (
            <SplitPaneWrapper
              key={wrapperKey}
              isCollapsed={isCollapsed}
              minSize={getPaneMinSize(pane)}
              defaultSize={getPaneDefaultSize(pane)}
            >
              <PaneRouterContext.Provider value={paneRouterContext}>
                {pane === LOADING_PANE ? (
                  <LoadingPane
                    key={paneKey} // Use key to force rerendering pane on ID change
                    path={path}
                    index={i}
                    message={getWaitMessages}
                    onExpand={this.handlePaneExpand}
                    onCollapse={this.handlePaneCollapse}
                    isCollapsed={isCollapsed}
                    isSelected={i === panes.length - 1}
                  />
                ) : (
                  <DeskToolPane
                    key={paneKey} // Use key to force rerendering pane on ID change
                    paneKey={paneKey}
                    index={i}
                    itemId={itemId}
                    urlParams={params}
                    childItemId={childItemId}
                    onExpand={this.handlePaneExpand}
                    onCollapse={this.handlePaneCollapse}
                    isCollapsed={isCollapsed}
                    isSelected={i === panes.length - 1}
                    isClosable={siblingIndex > 0}
                    isActive={i === panes.length - 2}
                    {...pane}
                  />
                )}
              </PaneRouterContext.Provider>
            </SplitPaneWrapper>
          )
        })
      )
    }, [])
  }

  setPortalElement = (portalElement) => {
    this.portalElement = portalElement
  }

  render() {
    const {hasNarrowScreen} = this.state
    return (
      <Root ref={this._rootElement}>
        <PortalProvider element={this.portalElement || null}>
          <SplitController
            isMobile={hasNarrowScreen}
            autoCollapse={this.props.autoCollapse}
            collapsedWidth={COLLAPSED_WIDTH}
            onCheckCollapse={this.handleCheckCollapse}
          >
            {this.renderPanes()}
          </SplitController>
          <div data-portal="" ref={this.setPortalElement} />
        </PortalProvider>
      </Root>
    )
  }
}
