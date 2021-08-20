// @todo: remove the following line when part imports has been removed from this file
///<reference types="@sanity/types/parts" />

import {UserAvatar, useZIndex} from '@sanity/base/components'
import {Layer, Card, Flex, Text, Box, Button, Stack, useGlobalKeyDown} from '@sanity/ui'
import {CloseIcon, LeaveIcon} from '@sanity/icons'
import React, {useEffect, useRef} from 'react'
import ToolMenu from 'part:@sanity/default-layout/tool-switcher'
import styled from 'styled-components'
import {DatasetSelect} from '../datasetSelect'
import {Router, Tool, User} from '../types'
import {HAS_SPACES} from '../util/spaces'

interface Props {
  activeToolName: string | null
  isOpen: boolean
  onClose: () => void
  onSignOut: () => void
  onSwitchTool: () => void
  router: Router
  tools: Tool[]
  user: User
}

const Root = styled(Layer)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`

const Backdrop = styled(Box)<{$open: boolean}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: ${({$open}) => ($open ? 1 : 0)};
  background: var(--card-shadow-penumbra-color);
  transition: 200ms opacity ease-in-out;
  pointer-events: ${({$open}) => ($open ? 'all' : 'none')};
`

const InnerCard = styled(Card)<{$open: boolean}>`
  position: relative;
  pointer-events: all;
  flex-direction: column;
  min-width: 200px;
  max-width: 280px;
  transform: ${({$open}) => ($open ? 'translate(0%)' : 'translate(-100%)')};
  transition: 200ms transform ease-in-out;
`

export function SideMenu(props: Props) {
  const {activeToolName, isOpen, onClose, onSignOut, onSwitchTool, router, tools, user} = props
  const zIndex = useZIndex()
  const closeButtonRef = useRef<HTMLButtonElement>()
  const tabIndex = isOpen ? 0 : -1

  useGlobalKeyDown((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose()
    }
  })

  useEffect(() => {
    if (isOpen) {
      closeButtonRef?.current?.focus()
    }
  }, [isOpen])

  return (
    <Root zOffset={zIndex.drawer}>
      <Backdrop $open={isOpen} onClick={onClose} />

      <InnerCard display="flex" height="fill" $open={isOpen}>
        <Card borderBottom>
          <Stack space={3} padding={2}>
            <Flex align="center">
              <Flex flex={1} align="center" paddingRight={2}>
                <Flex flex={1} align="center">
                  <Box>
                    <UserAvatar size="medium" userId="me" />
                  </Box>
                  <Box flex={1} marginLeft={2} title={user.name || user.email}>
                    <Text textOverflow="ellipsis">{user.name || user.email}</Text>
                  </Box>
                </Flex>
              </Flex>

              <Box>
                <Button
                  ref={closeButtonRef}
                  icon={CloseIcon}
                  onClick={onClose}
                  tabIndex={tabIndex}
                  title="Close menu"
                  mode="bleed"
                />
              </Box>
            </Flex>

            {HAS_SPACES && (
              <Box>
                <DatasetSelect />
              </Box>
            )}
          </Stack>
        </Card>

        <Box flex={1} overflow="auto" padding={2}>
          <ToolMenu
            activeToolName={activeToolName}
            isVisible={isOpen}
            onSwitchTool={onSwitchTool}
            router={router}
            tools={tools}
          />
        </Box>

        <Card paddingX={2} paddingY={3} borderTop>
          <Button
            style={{width: '100%'}}
            justify="flex-start"
            icon={LeaveIcon}
            text="Sign out"
            onClick={onSignOut}
            tabIndex={tabIndex}
            mode="bleed"
          />
        </Card>
      </InnerCard>
    </Root>
  )
}
