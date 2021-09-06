// @todo: remove the following line when part imports has been removed from this file
///<reference types="@sanity/types/parts" />

import {SanityDocument} from '@sanity/types'
import {SanityDefaultPreview} from 'part:@sanity/base/preview'
import React from 'react'
import {Subscription} from 'rxjs'
import {getPreviewState$, getStatusIndicator, getValueWithFallback} from './helpers'
import {PaneItemPreviewState} from './types'

export interface PaneItemPreviewProps {
  icon: React.FunctionComponent | boolean
  layout: 'inline' | 'block' | 'default' | 'card' | 'media' | 'detail'
  schemaType: any
  value: SanityDocument
}

export class PaneItemPreview extends React.Component<PaneItemPreviewProps, PaneItemPreviewState> {
  state: PaneItemPreviewState = {}

  subscription: Subscription

  constructor(props: PaneItemPreviewProps) {
    super(props)

    const {value, schemaType} = props
    const {title} = value

    let sync = true

    this.subscription = getPreviewState$(schemaType, value._id, title).subscribe((state) => {
      if (sync) {
        this.state = state
      } else {
        this.setState(state)
      }
    })

    sync = false
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  render() {
    const {value, schemaType, layout, icon} = this.props
    const {draft, published, isLoading} = this.state

    return (
      <SanityDefaultPreview
        value={getValueWithFallback({value, draft, published})}
        isPlaceholder={isLoading}
        icon={icon}
        layout={layout}
        type={schemaType}
        status={isLoading ? null : getStatusIndicator(draft, published)}
      />
    )
  }
}
