// @todo: remove the following line when part imports has been removed from this file

import React from 'react'
import {Tooltip, Placement, Card, Flex} from '@sanity/ui'
import {UserAvatar} from '../components/UserAvatar'
import {FormFieldPresence} from './types'

import styles from './PresenceTooltip.css'

interface PresenceTooltipProps {
  children?: React.ReactElement
  items: FormFieldPresence[]
  placement?: Placement
}

export function PresenceTooltip(props: PresenceTooltipProps) {
  const {children, items, placement} = props

  const content = (
    <Card padding={2}>
      {items.map((item) => (
        <Card key={item.user.id} padding={1}>
          <Flex align="center">
            <div>
              <UserAvatar user={item.user} status="online" />
            </div>

            <div className={styles.textContainer}>{item.user.displayName}</div>
          </Flex>
        </Card>
      ))}
    </Card>
  )

  return (
    <Tooltip content={content} placement={placement}>
      {children}
    </Tooltip>
  )
}
