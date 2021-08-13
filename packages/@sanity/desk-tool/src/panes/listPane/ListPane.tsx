import React, {useCallback} from 'react'
import {Box, Stack} from '@sanity/ui'
import DefaultPane from 'part:@sanity/components/panes/default'
import listStyles from 'part:@sanity/components/lists/default-style'
import {
  MenuItem as MenuItemType,
  MenuItemGroup as MenuItemGroupType,
} from '@sanity/base/__legacy/@sanity/components'
import {PaneItem} from '../../components/paneItem'
import {ListView} from '../../components/listView'

interface ListPaneItem {
  id: string
  icon?: boolean
  type: string
  displayOptions?: {showIcon?: boolean}
  schemaType?: {name?: string}
}

interface ListPaneProps {
  index: number
  title: string
  childItemId: string
  className?: string
  defaultLayout?: string
  items?: ListPaneItem[]
  menuItems?: MenuItemType[]
  menuItemGroups?: MenuItemGroupType[]
  displayOptions?: {
    showIcons?: boolean
  }
  isSelected: boolean
  isActive: boolean
  isCollapsed: boolean
  onExpand?: () => void
  onCollapse?: () => void
}

export function ListPane(props: ListPaneProps) {
  const {
    title,
    childItemId,
    className,
    defaultLayout,
    displayOptions = {},
    items = [],
    index,
    menuItems = [],
    menuItemGroups = [],
    isSelected,
    isCollapsed,
    onCollapse,
    onExpand,
    isActive,
  } = props

  const paneShowIcons = displayOptions.showIcons

  const itemIsSelected = useCallback(
    (item: ListPaneItem) => {
      return childItemId === item.id
    },
    [childItemId]
  )

  const shouldShowIconForItem = useCallback(
    (item: ListPaneItem) => {
      const itemShowIcon = item.displayOptions?.showIcon

      // Specific true/false on item should have presedence over list setting
      if (typeof itemShowIcon !== 'undefined') {
        return itemShowIcon === false ? false : item.icon
      }

      // If no item setting is defined, defer to the pane settings
      return paneShowIcons === false ? false : item.icon
    },
    [paneShowIcons]
  )

  return (
    <DefaultPane
      data-testid="desk-tool-list-pane"
      index={index}
      title={title}
      className={className}
      isSelected={isSelected}
      isCollapsed={isCollapsed}
      onCollapse={onCollapse}
      onExpand={onExpand}
      menuItems={menuItems}
      menuItemGroups={menuItemGroups}
    >
      <ListView layout={defaultLayout}>
        <Stack overflow="auto" paddingY={2} space={1}>
          {items.map((item) =>
            item.type === 'divider' ? (
              <Box paddingY={1} key={item.id}>
                <hr className={listStyles.divider} />
              </Box>
            ) : (
              <Box key={item.id} paddingX={2}>
                <PaneItem
                  id={item.id}
                  index={index}
                  value={item}
                  icon={shouldShowIconForItem(item)}
                  layout={defaultLayout}
                  isSelected={itemIsSelected(item)}
                  isActive={isActive}
                  schemaType={item.schemaType}
                />
              </Box>
            )
          )}
        </Stack>
      </ListView>
    </DefaultPane>
  )
}
