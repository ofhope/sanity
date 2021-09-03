// @todo: remove the following line when part imports has been removed from this file
///<reference types="@sanity/types/parts" />

import React from 'react'
import {List as GridList} from 'part:@sanity/components/lists/grid'
import styles from './ListView.module.css'

interface ListViewProps {
  children?: React.ReactNode
  layout?: 'inline' | 'block' | 'default' | 'card' | 'media'
}

export function ListView(props: ListViewProps) {
  const {children, layout = 'defaullt'} = props

  if (layout === 'card') {
    return <GridList className={styles.cardList}>{children}</GridList>
  }

  if (layout === 'media') {
    return <GridList className={styles.mediaList}>{children}</GridList>
  }

  return children
}
