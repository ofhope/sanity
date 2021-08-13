import React, {createElement} from 'react'
import DefaultPane from 'part:@sanity/components/panes/default'
import {MenuItem, MenuItemGroup} from '@sanity/base/__legacy/@sanity/components'
import {isValidElementType} from 'react-is'
import userComponentPaneStyles from './UserComponentPane.css'

interface UserComponentPaneProps {
  // styles?: object, // eslint-disable-line react/forbid-prop-types
  title?: string
  index: number
  type: string
  component: React.ComponentType | React.ReactNode
  options?: Record<string, unknown> // eslint-disable-line react/forbid-prop-types
  isSelected: boolean
  isCollapsed: boolean
  onExpand?: () => void
  onCollapse?: () => void
  renderActions?: () => void
  menuItems?: MenuItem[]
  menuItemGroups?: MenuItemGroup[]
}

function noActionFn() {
  // eslint-disable-next-line no-console
  console.warn('No handler defined for action')
}

const EMPTY_ARRAY = []
const EMPTY_RECORD = {}

export class UserComponentPane extends React.PureComponent<UserComponentPaneProps> {
  static defaultProps = {
    title: '',
    options: EMPTY_RECORD,
    menuItems: EMPTY_ARRAY,
    menuItemGroups: EMPTY_ARRAY,
    styles: undefined,
    onExpand: undefined,
    onCollapse: undefined,
    renderActions: undefined,
  }

  userComponent: React.RefObject<any>

  constructor(props: UserComponentPaneProps) {
    super(props)

    this.userComponent = React.createRef()
  }

  handleAction = (item: MenuItem) => {
    let handler: MenuItem['action'] | null = null

    if (typeof item.action === 'function') {
      handler = item.action
    } else {
      handler =
        this.userComponent &&
        this.userComponent.current &&
        this.userComponent.current.actionHandlers &&
        this.userComponent.current.actionHandlers[item.action as any]
    }

    if (typeof handler === 'function') {
      handler(item.params, this)
    } else {
      noActionFn()
    }
  }

  render() {
    const {
      isSelected,
      isCollapsed,
      onCollapse,
      onExpand,
      component,
      index,
      // styles,
      title,
      type,
      menuItems = [],
      menuItemGroups = [],
      renderActions,
      ...rest
    } = this.props

    const hideHeader = !title && !menuItems.length && !renderActions
    const paneStyles = hideHeader ? {header: userComponentPaneStyles.noHeader} : {}
    // const UserComponent = typeof component === 'function' && component

    return (
      <DefaultPane
        styles={paneStyles}
        title={title}
        menuItems={menuItems}
        menuItemGroups={menuItemGroups}
        isSelected={isSelected}
        isCollapsed={isCollapsed}
        onCollapse={onCollapse}
        onExpand={onExpand}
        onAction={this.handleAction}
      >
        {isValidElementType(component) &&
          createElement(component, {...rest, ref: this.userComponent})}
        {/* {UserComponent ? <UserComponent ref={this.userComponent} {...rest} /> : component} */}
      </DefaultPane>
    )
  }
}
