import {Card, Container, Flex, LayerProvider} from '@sanity/ui'
import React from 'react'
import {useAction, useSelect} from '@sanity/ui-workshop'
import PortableTextInput from '../PortableTextInput'
import FormBuilderContext from '../../../FormBuilderContext'
import {schema, portableTextType} from './schemas/default'

const noop = () => undefined
const subscribe = () => noop

function inputResolver() {
  return PortableTextInput
}

const testValues = {
  empty: undefined,
  withText: [
    {
      _type: 'block',
      _key: 'a',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'a1',
          text: 'Lala',
          marks: [],
        },
      ],
    },
  ],
}

const exampleOptions = {Empty: 'empty', 'With Text': 'withText'}

export default function ExampleStory() {
  const example = useSelect('Example', exampleOptions) || 'empty'
  const val = testValues[example]
  return (
    <LayerProvider>
      <FormBuilderContext
        value={undefined}
        patchChannel={{onPatch: noop}}
        schema={schema}
        resolveInputComponent={inputResolver}
        resolvePreviewComponent={noop}
      >
        <Card height="fill" padding={4} tone="transparent">
          <Flex align="center" height="fill" justify="center">
            <Container width={0}>
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
                type={portableTextType}
                value={val}
                subscribe={subscribe}
              />
            </Container>
          </Flex>
        </Card>
      </FormBuilderContext>
    </LayerProvider>
  )
}
