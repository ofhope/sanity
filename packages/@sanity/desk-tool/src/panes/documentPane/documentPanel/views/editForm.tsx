// @todo: remove the following line when part imports has been removed from this file
///<reference types="@sanity/types/parts" />

import {useDocumentPresence} from '@sanity/base/hooks'
import {SanityDocument} from '@sanity/types'
import {Box} from '@sanity/ui'
import {FormBuilder} from 'part:@sanity/form-builder'
import documentStore from 'part:@sanity/base/datastore/document'
import React, {FormEvent, useEffect, useRef, memo} from 'react'
import {Subscription} from 'rxjs'
import {tap} from 'rxjs/operators'

const preventDefault = (ev: FormEvent) => ev.preventDefault()

type Schema = any
type SchemaType = any

interface Props {
  id: string
  value: Partial<SanityDocument> | null
  compareValue: SanityDocument | null

  filterField: () => boolean
  focusPath: any[]
  markers: any[]

  onBlur: () => void
  onChange: (event: any) => void
  onFocus: (focusPath: any[]) => void
  readOnly: boolean
  schema: Schema
  type: SchemaType
}

export const EditForm = memo((props: Props) => {
  const presence = useDocumentPresence(props.id)
  const subscriptionRef = useRef<Subscription | null>(null)
  const patchChannelRef = useRef<any>(null)
  const {
    filterField,
    focusPath,
    markers,
    value,
    onBlur,
    onFocus,
    onChange,
    compareValue,
    readOnly,
    schema,
    type,
  } = props

  useEffect(() => {
    patchChannelRef.current = FormBuilder.createPatchChannel()
  }, [])

  useEffect(() => {
    const patchChannel = patchChannelRef.current

    if (patchChannel) return undefined

    subscriptionRef.current = documentStore.pair
      .documentEvents(props.id, props.type.name)
      .pipe(
        tap((event: any) => {
          patchChannel.receiveEvent(event)
        })
      )
      .subscribe()

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [props.id, props.type.name])

  return (
    <Box as="form" onSubmit={preventDefault}>
      <FormBuilder
        schema={schema}
        patchChannel={patchChannelRef.current}
        value={value || {_type: type}}
        compareValue={compareValue}
        type={type}
        presence={presence}
        filterField={filterField}
        readOnly={!patchChannelRef.current || readOnly}
        onBlur={onBlur}
        onFocus={onFocus}
        focusPath={focusPath}
        onChange={onChange}
        markers={markers}
      />
    </Box>
  )
})

EditForm.displayName = 'EditForm'
