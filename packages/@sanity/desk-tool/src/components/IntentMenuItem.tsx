// @todo: remove the following line when part imports has been removed from this file
///<reference types="@sanity/types/parts" />

import {Intent, MenuItem as MenuItemType} from '@sanity/base/__legacy/@sanity/components'
import {MenuItem} from '@sanity/ui'
import {IntentLink} from 'part:@sanity/base/router'
import React, {forwardRef, useMemo} from 'react'

export const IntentMenuItem = forwardRef(function IntentMenuItem(
  props: {
    intent: Intent
    item: MenuItemType
  },
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {intent, item} = props
  const intentType = intent.type
  const params = useMemo(() => intent.params || {}, [intent.params])

  const Link = useMemo(
    () =>
      // eslint-disable-next-line no-shadow
      forwardRef(function Link(
        linkProps: {children: React.ReactNode},
        linkRef: React.ForwardedRef<HTMLAnchorElement>
      ) {
        return (
          <IntentLink
            {...linkProps}
            intent={intentType}
            params={params as any}
            ref={linkRef as any}
          />
        )
      }),
    [intentType, params]
  )

  return <MenuItem as={Link as any} data-as="a" icon={item.icon} ref={ref} text={item.title} />
})
