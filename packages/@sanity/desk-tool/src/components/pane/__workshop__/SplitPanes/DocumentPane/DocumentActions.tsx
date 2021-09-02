import {ChevronDownIcon, PublishIcon} from '@sanity/icons'
import {Button, Flex, Menu, MenuButton, MenuItem, Stack, useToast} from '@sanity/ui'
import React, {useCallback} from 'react'

export function DocumentActions() {
  const {push: pushToast} = useToast()

  const publish = useCallback(
    () => pushToast({status: 'success', title: 'Successfully published'}),
    [pushToast]
  )

  return (
    <Flex gap={1}>
      <Stack flex={1}>
        <Button icon={PublishIcon} onClick={publish} text="Publish" tone="positive" />
      </Stack>
      <MenuButton
        button={<Button icon={ChevronDownIcon} mode="ghost" />}
        id="actions"
        menu={
          <Menu>
            <MenuItem text="Discard changes" />
          </Menu>
        }
        popover={{constrainSize: true, portal: true}}
      />
    </Flex>
  )
}
