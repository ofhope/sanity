import {Box, Card, Flex, rem, Text} from '@sanity/ui'
import React from 'react'
import VirtualList from 'react-tiny-virtual-list'
import styled, {css} from 'styled-components'
import {DocumentsListPaneItem} from '../types'
import enhanceWithAvailHeight from './enhanceWithAvailHeight'

interface InfiniteListProps {
  height?: number
  items: DocumentsListPaneItem[]
  hasMoreItems?: boolean
  isLoadingMore?: boolean
  renderItem: (item: DocumentsListPaneItem, index: number) => React.ReactNode
  className?: string
  getItemKey: (item: DocumentsListPaneItem) => string
  layout?: 'default' | 'detail' | 'card' | 'media'
  onScroll?: (scrollTop: number, itemSize?: number) => void
}

interface InfiniteListState {
  triggerUpdate: number
  itemSize?: number
}

const StyledVirtualList = styled(VirtualList as any)(({theme}) => {
  const {space} = theme.sanity

  return css`
    padding: ${rem(space[1])} ${rem(space[2])} ${rem(space[2])};
    box-sizing: border-box;
  `
})

const ItemBox = styled.div(({theme}) => {
  const {space} = theme.sanity

  return css`
    padding-top: ${rem(space[1])};
  `
})

class InfiniteList extends React.PureComponent<InfiniteListProps, InfiniteListState> {
  static defaultProps = {
    hasMoreItems: false,
    isLoadingMore: false,
    layout: 'default',
    items: [],
    height: 250,
  }

  state: InfiniteListState = {
    triggerUpdate: 0,
    itemSize: undefined,
  }

  // @todo replace this with a something proper. This is hacky.
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(prevProps: InfiniteListProps) {
    if (prevProps.items !== this.props.items) {
      /**
       * This is needed to break equality checks
       * in VirtualList's sCU in cases where itemCount has not changed,
       * but an elements has been removed or added
       */
      this.setState({triggerUpdate: Math.random()})
    }

    if (prevProps.layout !== this.props.layout) {
      this.setState({
        itemSize: undefined,
      })
    }
  }

  setMeasureElement = (element: HTMLDivElement | null) => {
    if (element && element.offsetHeight) {
      this.setState({
        itemSize: element.offsetHeight,
      })
    }
  }

  renderItem = ({index, style}) => {
    const {renderItem, getItemKey, items, isLoadingMore} = this.props

    if (index === items.length) {
      return (
        <ItemBox key="more-items">
          <Card borderTop style={{...style, height: style.height - 1}}>
            <Flex align="center" height="fill" justify="center">
              <Text align="center" muted size={1}>
                {isLoadingMore ? 'Loading…' : 'This list contains more documents'}
              </Text>
            </Flex>
          </Card>
        </ItemBox>
      )
    }

    const item = items[index]

    return (
      <ItemBox key={getItemKey(item)} style={style}>
        {renderItem(item, index)}
      </ItemBox>
    )
  }

  handleScroll = (scrollTop: number) => {
    if (!this.props.onScroll) {
      return
    }

    this.props.onScroll(scrollTop, this.state.itemSize)
  }

  render() {
    const {layout, height, items, className, renderItem, hasMoreItems, isLoadingMore} = this.props
    const {triggerUpdate, itemSize} = this.state
    const addExtraItem = hasMoreItems || isLoadingMore

    if (!items || items.length === 0) {
      return <div />
    }

    if (!itemSize && items) {
      return (
        <Box padding={2} paddingTop={1}>
          <ItemBox ref={this.setMeasureElement}>{renderItem(items[0], 0)}</ItemBox>
        </Box>
      )
    }

    return (
      <StyledVirtualList
        key={layout} // forcefully re-render the whole list when layout changes
        data-trigger-update-hack={triggerUpdate} // see componentWillReceiveProps above
        onScroll={this.handleScroll}
        className={className || ''}
        height={height}
        itemCount={addExtraItem ? items.length + 1 : items.length}
        itemSize={itemSize}
        renderItem={this.renderItem}
        overscanCount={50}
      />
    )
  }
}

export default enhanceWithAvailHeight(InfiniteList as any) as React.ComponentType<
  Omit<InfiniteListProps, 'height'>
>
