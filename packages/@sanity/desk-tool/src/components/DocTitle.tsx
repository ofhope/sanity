// @todo: remove the following line when part imports has been removed from this file
///<reference types="@sanity/types/parts" />

import {SanityDocument} from '@sanity/types'
import React from 'react'
import schema from 'part:@sanity/base/schema'
import {PreviewFields} from 'part:@sanity/base/preview'

export interface DocTitleProps {
  document: Partial<SanityDocument>
}

const renderTitle = ({title}: SanityDocument) => <>{title}</>

const PREVIEW_FIELDS = ['title']

export function DocTitle(props: DocTitleProps) {
  const {document} = props
  const type = schema.get(document._type!)

  return (
    <PreviewFields document={document} fields={PREVIEW_FIELDS} layout="inline" type={type}>
      {renderTitle}
    </PreviewFields>
  )
}
