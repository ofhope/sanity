import React from 'react'
import {useAction} from '@sanity/ui-workshop'
import FormBuilderContext from '../../../FormBuilderContext'
import PortableTextInput from '../PortableTextInput'

const noop = () => undefined
const subscribe = () => noop

function inputResolver() {
  return PortableTextInput
}

type Props = {
  value: any
  schema: any
  type: any
}

export default function ExampleStory(props: Props) {
  return (
    <FormBuilderContext
      value={undefined}
      patchChannel={{onPatch: noop}}
      schema={props.schema}
      resolveInputComponent={inputResolver}
      resolvePreviewComponent={noop}
    >
      <PortableTextInput
        focusPath={[]}
        hotkeys={{}}
        level={1}
        markers={[]}
        onBlur={useAction('onBlur')}
        onFocus={useAction('onFocus')}
        onChange={useAction('onChange')}
        readOnly={false}
        presence={[]}
        type={props.type}
        value={props.value}
        subscribe={subscribe}
      />
    </FormBuilderContext>
  )
}
