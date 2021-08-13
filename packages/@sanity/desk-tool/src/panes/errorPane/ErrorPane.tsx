import React from 'react'
import DefaultPane from 'part:@sanity/components/panes/default'
import styles from './ErrorPane.css'

export function ErrorPane(props: {children?: React.ReactNode}) {
  return (
    <DefaultPane color="danger" title="Error" isSelected={false} isCollapsed={false}>
      <div className={styles.root}>{props.children}</div>
    </DefaultPane>
  )
}
