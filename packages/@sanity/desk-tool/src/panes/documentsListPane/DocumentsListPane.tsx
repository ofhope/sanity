import {SanityDocument} from '@sanity/types'
import {Box, Button, Container, Heading, Stack, Text} from '@sanity/ui'
import React from 'react'
import schema from 'part:@sanity/base/schema'
import DefaultPane from 'part:@sanity/components/panes/default'
import {getQueryResults} from 'part:@sanity/base/query-container'
import Spinner from 'part:@sanity/components/loading/spinner'
import {collate, getPublishedId} from 'part:@sanity/base/util/draft-utils'
import {isEqual} from 'lodash'
import {of, combineLatest, Subscription} from 'rxjs'
import {map, tap, filter as filterEvents} from 'rxjs/operators'
import shallowEquals from 'shallow-equals'
import settings from '../../settings'
import listViewStyles from '../../components/listView/ListView.css'
import {PaneItem} from '../../components/paneItem'
import styles from './DocumentsListPane.css'
import {InfiniteList} from './infiniteList'
import {DocumentsListPaneItem} from './types'

interface DocumentsListPaneProps {
  index: number
  title: string
  childItemId: string
  className?: string
  styles?: any // eslint-disable-line react/forbid-prop-types
  defaultLayout?: 'default' | 'detail' | 'card' | 'media'
  options: {
    filter: string
    defaultOrdering: {
      field: string
      direction?: 'asc' | 'desc'
    }[]
    params?: any // eslint-disable-line react/forbid-prop-types
  }
  menuItems?: {
    title: string
  }[]
  menuItemGroups?: {
    id: string
  }[]
  initialValueTemplates?: {
    templateId?: string
    parameters?: any // eslint-disable-line react/forbid-prop-types
  }[]
  displayOptions: {
    showIcons: boolean
  }
  isActive: boolean
  isSelected: boolean
  isCollapsed: boolean
  onExpand?: () => void
  onCollapse?: () => void
}

interface DocumentsListPaneState {
  queryResult: any
  sortOrder: {by: any; extendedProjection: any} | null
  layout: 'default' | 'detail' | 'card' | 'media' | null
  isLoadingMore: boolean
  hasFullSubscription: boolean
}

const PARTIAL_PAGE_LIMIT = 100
const FULL_LIST_LIMIT = 2000

const DEFAULT_ORDERING = [{field: '_createdAt', direction: 'desc'}]

function removePublishedWithDrafts(documents: SanityDocument[]): DocumentsListPaneItem[] {
  return collate(documents).map((entry) => {
    const doc = entry.draft || entry.published
    return {
      ...doc,
      hasPublished: !!entry.published,
      hasDraft: !!entry.draft,
    }
  })
}

function getDocumentKey(document: DocumentsListPaneItem) {
  return getPublishedId(document._id)
}

function getTypeNameFromSingleTypeFilter(filter, params = {}) {
  const pattern = /\b_type\s*==\s*(['"].*?['"]|\$.*?(?:\s|$))|\B(['"].*?['"]|\$.*?(?:\s|$))\s*==\s*_type\b/
  const matches = filter.match(pattern)
  if (!matches) {
    return null
  }

  const match = (matches[1] || matches[2]).trim().replace(/^["']|["']$/g, '')
  const typeName = match[0] === '$' ? params[match.slice(1)] : match
  return typeName || null
}

function isSimpleTypeFilter(filter) {
  return /^_type\s*==\s*['"$]\w+['"]?\s*$/.test(filter.trim())
}

function toOrderClause(orderBy) {
  return orderBy
    .map((ordering) =>
      [ordering.field, (ordering.direction || '').toLowerCase()]
        .map((str) => str.trim())
        .filter(Boolean)
        .join(' ')
    )
    .join(', ')
}

const EMPTY_ARRAY = []
const EMPTY_RECORD = {}

export default class DocumentsListPane extends React.PureComponent<
  DocumentsListPaneProps,
  DocumentsListPaneState
> {
  static defaultProps = {
    className: '',
    styles: EMPTY_RECORD,
    menuItems: EMPTY_ARRAY,
    menuItemGroups: EMPTY_ARRAY,
    displayOptions: EMPTY_RECORD,
    onExpand: undefined,
    onCollapse: undefined,
    defaultLayout: undefined,
    initialValueTemplates: undefined,
  }

  actionHandlers = {
    setLayout: ({layout}) => {
      this.layoutSetting.set(layout)
    },
    setSortOrder: (sort) => {
      this.sortOrderSetting.set(sort)
    },
  }

  state: DocumentsListPaneState = {
    queryResult: {},
    sortOrder: null,
    layout: null,
    isLoadingMore: false,
    hasFullSubscription: false,
  }

  atLoadingThreshold: boolean
  toast: any
  templateMenuId: string

  // subscriptions
  settingsSubscription: Subscription
  queryResults$: Subscription | null = null

  // settings
  sortOrderSetting: any
  layoutSetting: any

  constructor(props: DocumentsListPaneProps) {
    super(props)

    const {filter, params} = props.options
    const typeName = getTypeNameFromSingleTypeFilter(filter, params)
    const settingsNamespace = settings.forNamespace(typeName)

    this.atLoadingThreshold = false
    this.sortOrderSetting = settingsNamespace.forKey('sortOrder')
    this.layoutSetting = settingsNamespace.forKey('layout')

    // Passed to rendered <Menu> components. This prevents the "click outside"
    // functionality from kicking in when pressing the toggle menu button
    this.templateMenuId = Math.random().toString(36).substr(2, 6)

    let sync = true
    this.settingsSubscription = combineLatest(
      this.sortOrderSetting.listen(DEFAULT_ORDERING),
      this.layoutSetting.listen()
    )
      .pipe(
        map(([sortOrder, layout]) => ({
          sortOrder,
          layout,
        })),
        tap((nextState: any) => {
          if (sync) {
            // eslint-disable-next-line react/no-direct-mutation-state
            this.state = {...this.state, ...nextState}
          } else {
            this.setState(nextState)
          }
        })
      )
      .subscribe()

    sync = false
  }

  componentDidMount() {
    this.setupQuery({fullList: false})
  }

  componentWillUnmount() {
    this.settingsSubscription.unsubscribe()

    if (this.queryResults$) {
      this.queryResults$.unsubscribe()
    }
  }

  itemIsSelected(item) {
    return this.props.childItemId === getPublishedId(item._id)
  }

  renderItem = (item) => (
    <PaneItem
      id={getPublishedId(item._id)}
      layout={this.state.layout || this.props.defaultLayout || 'default'}
      value={item}
      icon={this.props.displayOptions.showIcons === false ? false : undefined}
      schemaType={schema.get(item._type)}
      isSelected={this.itemIsSelected(item)}
      isActive={this.props.isActive}
    />
  )

  handleAction = (item) => {
    const handler =
      typeof item.action === 'function' ? item.action : this.actionHandlers[item.action]

    if (!handler) {
      return false
    }

    handler(item.params, this)
    return true
  }

  componentDidUpdate(prevProps, prevState) {
    // If the filter/params has changed, set up a new query from scratch
    const queryChanged =
      prevProps.options.filter !== this.props.options.filter ||
      !shallowEquals(prevProps.options.params, this.props.options.params)

    // If sort changed, set up a new query from scratch as well
    const sortChanged = !isEqual(this.state.sortOrder, prevState.sortOrder)

    if (queryChanged || sortChanged) {
      this.setupQuery({fullList: false})
    }
  }

  setupQuery({fullList = false}) {
    if (this.queryResults$) {
      this.queryResults$.unsubscribe()
    }

    const params = this.props.options.params || {}
    const query = this.buildListQuery({fullList})

    this.queryResults$ = getQueryResults(of({query, params}), {tag: 'desk.document-list'})
      .pipe(filterEvents(fullList ? ({result}) => result : () => true))
      .subscribe((queryResult) =>
        this.setState({queryResult, isLoadingMore: false, hasFullSubscription: fullList})
      )
  }

  handleScroll = (scrollTop, itemHeight) => {
    const {queryResult, isLoadingMore, hasFullSubscription} = this.state
    const {result} = queryResult
    const documents = (result && result.documents) || []
    const mightHaveMoreItems = documents.length === PARTIAL_PAGE_LIMIT
    if (
      this.atLoadingThreshold ||
      isLoadingMore ||
      hasFullSubscription ||
      !result ||
      !mightHaveMoreItems
    ) {
      return
    }

    if (scrollTop >= itemHeight * (PARTIAL_PAGE_LIMIT / 2)) {
      // Prevent scroll handler from firing again before setState kicks in
      this.atLoadingThreshold = true
      this.setState({isLoadingMore: true, hasFullSubscription: true}, () => {
        // Technically still here, but is only used to guard against double-firing
        this.atLoadingThreshold = false
      })

      this.setupQuery({fullList: true})
    }
  }

  buildListQuery({fullList}) {
    const {options} = this.props
    const {filter, defaultOrdering} = options
    const {sortOrder} = this.state
    const extendedProjection = sortOrder && sortOrder.extendedProjection
    const projectionFields = ['_id', '_type']
    const finalProjection = projectionFields.join(', ')
    const sortBy = (sortOrder && sortOrder.by) || defaultOrdering || []
    const limit = fullList ? FULL_LIST_LIMIT : PARTIAL_PAGE_LIMIT
    const sort = sortBy.length > 0 ? sortBy : DEFAULT_ORDERING

    if (extendedProjection) {
      const firstProjection = projectionFields.concat(extendedProjection).join(', ')
      // At first glance, you might think that 'order' should come before 'slice'?
      // However, this is actullay a counter-bug
      // to https://github.com/sanity-io/gradient/issues/922 which causes:
      // 1. case-insensitive ordering (we want this)
      // 2. null-values to sort to the top, even when order is desc (we don't want this)
      // Because Studios in the wild rely on the buggy nature of this
      // do not change this until we have API versioning
      return [
        `*[${filter}] [0...${limit}]`,
        `{${firstProjection}}`,
        `order(${toOrderClause(sort)})`,
        `{${finalProjection}}`,
      ].join(' | ')
    }

    return `*[${filter}] | order(${toOrderClause(sort)}) [0...${limit}] {${finalProjection}}`
  }

  setToast = (toast) => {
    this.toast = toast
  }

  renderResults() {
    const {queryResult, isLoadingMore} = this.state
    const {result} = queryResult
    if (!result) {
      return null
    }

    const {options, defaultLayout} = this.props
    const layout = this.state.layout || defaultLayout || 'default'
    const filterIsSimpleTypeContraint = isSimpleTypeFilter(options.filter)
    const items = removePublishedWithDrafts(result ? result.documents : [])

    if (!items || items.length === 0) {
      return (
        <div className={styles.empty}>
          <div>
            <h3>
              {filterIsSimpleTypeContraint
                ? 'No documents of this type found'
                : 'No documents matching this filter found'}
            </h3>
          </div>
        </div>
      )
    }

    return (
      <div className={styles[`layout__${layout}`]}>
        {items && (
          <InfiniteList
            className={listViewStyles.scroll}
            items={items}
            layout={layout}
            getItemKey={getDocumentKey}
            renderItem={this.renderItem}
            onScroll={this.handleScroll}
            hasMoreItems={items.length === FULL_LIST_LIMIT}
            isLoadingMore={isLoadingMore}
          />
        )}
      </div>
    )
  }

  renderContent() {
    const {defaultLayout} = this.props
    const layout = this.state.layout || defaultLayout || 'default'
    const {loading, error, onRetry} = this.state.queryResult

    if (error) {
      return (
        <div className={styles[`layout__${layout}`]}>
          <Container width={1}>
            <Stack paddingX={4} paddingY={5} space={4}>
              <Heading>Could not fetch list items</Heading>
              <Text>
                Error: <code>{error.message}</code>
              </Text>
              <Box>
                <Button onClick={onRetry} text="Retry" tone="primary" />
              </Box>
            </Stack>
          </Container>
        </div>
      )
    }

    if (loading) {
      return (
        <div className={`${styles[`layout__${layout}`]} ${styles.loading}`}>
          {loading && <Spinner center message="Loading items…" />}
        </div>
      )
    }

    return this.renderResults()
  }

  render() {
    const {
      title,
      className,
      isCollapsed,
      isSelected,
      onCollapse,
      onExpand,
      menuItems,
      menuItemGroups,
      initialValueTemplates,
      isActive,
    } = this.props

    return (
      <DefaultPane
        title={title}
        className={className}
        styles={this.props.styles}
        index={this.props.index}
        menuItems={menuItems}
        menuItemGroups={menuItemGroups}
        initialValueTemplates={initialValueTemplates}
        isSelected={isSelected}
        isCollapsed={isCollapsed}
        isActive={isActive}
        onCollapse={onCollapse}
        onAction={this.handleAction}
        onExpand={onExpand}
      >
        {this.renderContent()}
      </DefaultPane>
    )
  }
}
