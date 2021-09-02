import type {ValidationMarker} from '@sanity/types'
import {Box, LayerProvider, TextInput} from '@sanity/ui'
import React, {useMemo} from 'react'
import type {FormFieldPresence} from '../../../presence'
import {FormField} from '../FormField'

const noop: any = () => undefined

export default function ExampleStory() {
  const presence: FormFieldPresence[] = useMemo(
    () => [
      {
        user: {
          id: 'test',
          // displayName: '',
          // imageUrl?: string
          // email?: string
        },
        path: [],
        sessionId: 'foo',
        lastActiveAt: new Date().toUTCString(),
      },
    ],
    []
  )

  const markers: ValidationMarker[] = useMemo(
    () => [
      {
        type: 'validation',
        level: 'error',
        item: {
          message: 'Something is not right',
          // children?: ValidationError[]
          // operation?: 'AND' | 'OR'
          paths: [],
          cloneWithMessage: noop,
        },
      },
    ],
    []
  )

  return (
    <Box padding={4}>
      <LayerProvider>
        <FormField
          __unstable_markers={markers}
          __unstable_presence={presence}
          title="Title"
          description="Description"
        >
          <TextInput />
        </FormField>
      </LayerProvider>
    </Box>
  )
}
