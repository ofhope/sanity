import {Box, TextArea} from '@sanity/ui'
import React from 'react'
import {ChangeBar} from '../ChangeBar'

export default function ExampleStory() {
  return (
    <Box padding={4}>
      <ChangeBar isChanged hasFocus>
        <TextArea />
      </ChangeBar>
    </Box>
  )
}
