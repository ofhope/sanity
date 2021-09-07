// @todo: remove the following line when part imports has been removed from this file
///<reference types="@sanity/types/parts" />

import React, {createElement, useCallback, useState, useEffect, useMemo} from 'react'
import {SearchIcon, MenuIcon, ComposeIcon, CloseIcon} from '@sanity/icons'
import {Button, Card, Tooltip, useMediaIndex, Text, Box, Flex, useGlobalKeyDown} from '@sanity/ui'
import {InsufficientPermissionsMessage, LegacyLayerProvider} from '@sanity/base/components'
import {StateLink} from '@sanity/state-router/components'
// eslint-disable-next-line camelcase
import {unstable_useCanCreateAnyOf, useCurrentUser} from '@sanity/base/hooks'
import config from 'config:sanity'
import * as sidecar from 'part:@sanity/default-layout/sidecar?'
import styled from 'styled-components'
import {HAS_SPACES} from '../util/spaces'
import {Router, Tool} from '../types'
import {DatasetSelect} from '../datasetSelect'
import Branding from './branding/Branding'
import SanityStatusContainer from './studioStatus/SanityStatusContainer'
import {PresenceMenu, LoginStatus, SearchField, ToolMenuCollapse} from '.'

interface Props {
  createMenuIsOpen: boolean
  documentTypes: string[]
  onCreateButtonClick: () => void
  onToggleMenu: () => void
  onUserLogout: () => void
  router: Router
  searchIsOpen: (open: boolean) => void
  searchPortalElement: HTMLDivElement | null
  tools: Tool[]
}

const StateLinkWrap = styled(Box)`
  text-decoration: none;
  color: inherit;
  display: block;
  border-radius: ${({theme}) => theme.sanity.radius[2]}px;

  &:focus {
    outline: 0;
    box-shadow: inset 0 0 0 1px var(--card-focus-ring-color), 0 0 0 1px var(--card-focus-ring-color);
  }
`

export function Navbar(props: Props) {
  const {
    createMenuIsOpen,
    documentTypes,
    onCreateButtonClick,
    onToggleMenu,
    onUserLogout,
    router,
    searchIsOpen,
    searchPortalElement,
    tools,
  } = props

  const [searchOpen, setSearchOpen] = useState<boolean>(false)
  const [inputElement, setInputElement] = useState<HTMLInputElement | null>(null)
  const [searchButtonElement, setSearchButtonElement] = useState<HTMLButtonElement | null>(null)
  const {value: currentUser} = useCurrentUser()
  const createAnyPermission = unstable_useCanCreateAnyOf(documentTypes)
  const mediaIndex = useMediaIndex()
  const rootState = useMemo(
    () => (HAS_SPACES && router.state.space ? {space: router.state.space} : {}),
    [router.state.space]
  )

  useGlobalKeyDown((e) => {
    if (e.key === 'Escape' && searchOpen) {
      setSearchOpen(false)
      searchButtonElement?.focus()
    }
  })

  const handleToggleSearchOpen = useCallback(() => {
    setSearchOpen((prev) => {
      if (prev) {
        searchButtonElement?.focus()
      }

      return !prev
    })
  }, [searchButtonElement])

  useEffect(() => {
    searchIsOpen(searchOpen)

    if (searchOpen) {
      inputElement?.focus()
    }
  }, [inputElement, searchButtonElement, searchIsOpen, searchOpen])

  const LinkComponent = useCallback(
    (linkProps) => {
      return <StateLink state={rootState} {...linkProps} />
    },
    [rootState]
  )

  const shouldRender = {
    brandingCenter: mediaIndex <= 1,
    collapsedPresenceMenu: mediaIndex <= 1,
    hints: mediaIndex > 1 && sidecar && sidecar.isSidecarEnabled && sidecar.isSidecarEnabled(),
    loginStatus: mediaIndex > 1,
    searchFullscreen: mediaIndex <= 1,
    spaces: HAS_SPACES && mediaIndex >= 3,
    statusContainer: mediaIndex > 1,
    tools: mediaIndex >= 3,
  }

  return (
    <Card
      padding={2}
      scheme="dark"
      display="flex"
      style={{alignItems: 'center', position: 'relative'}}
      sizing="border"
    >
      <Flex flex={1} align="center" gap={2} justify="space-between">
        <Flex gap={2} flex={1} align="center" style={{width: 'max-content'}}>
          {!shouldRender.tools && (
            <Button
              aria-label="Open menu"
              icon={MenuIcon}
              mode="bleed"
              onClick={onToggleMenu}
              title="Open menu"
            />
          )}

          {!shouldRender.brandingCenter && (
            <StateLinkWrap forwardedAs={LinkComponent} state={rootState}>
              <Branding projectName={config && config.project.name} />
            </StateLinkWrap>
          )}

          {shouldRender.spaces && (
            <Flex>
              <DatasetSelect />
            </Flex>
          )}

          <LegacyLayerProvider zOffset="navbarPopover">
            <Tooltip
              portal
              scheme="light"
              content={
                <Box padding={2}>
                  {createAnyPermission.granted ? (
                    <Text size={1} muted>
                      Create new document
                    </Text>
                  ) : (
                    <InsufficientPermissionsMessage
                      currentUser={currentUser}
                      operationLabel="create any document"
                    />
                  )}
                </Box>
              }
            >
              <Button
                aria-label="Create new document"
                data-testid="default-layout-global-create-button"
                icon={ComposeIcon}
                mode="bleed"
                onClick={onCreateButtonClick}
                disabled={!createAnyPermission.granted}
                selected={createMenuIsOpen}
              />
            </Tooltip>
          </LegacyLayerProvider>

          <LegacyLayerProvider zOffset="navbarPopover">
            {(searchOpen || !shouldRender.searchFullscreen) && (
              <Card
                flex={1}
                paddingX={shouldRender.searchFullscreen ? 2 : undefined}
                paddingY={shouldRender.searchFullscreen ? 2 : undefined}
                scheme="dark"
                style={{
                  minWidth: 253,
                  inset: 0,
                  zIndex: 1,
                  maxWidth: shouldRender.searchFullscreen ? undefined : 350,
                  position: shouldRender.searchFullscreen ? 'absolute' : undefined,
                }}
              >
                <Flex flex={1}>
                  <Box flex={1} marginRight={shouldRender.searchFullscreen ? 2 : undefined}>
                    <SearchField
                      portalElement={searchPortalElement}
                      inputElement={setInputElement}
                      fullScreen={shouldRender.searchFullscreen}
                    />
                  </Box>
                  {shouldRender.searchFullscreen && (
                    <Button
                      icon={CloseIcon}
                      aria-label="Close search"
                      onClick={handleToggleSearchOpen}
                      mode="bleed"
                    />
                  )}
                </Flex>
              </Card>
            )}
          </LegacyLayerProvider>

          {shouldRender.tools && (
            <Card borderRight paddingRight={2} flex={1}>
              <LegacyLayerProvider zOffset="navbarPopover">
                <ToolMenuCollapse tools={tools} router={router} />
              </LegacyLayerProvider>
            </Card>
          )}
        </Flex>

        {shouldRender.brandingCenter && (
          <Box
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
            }}
          >
            <StateLinkWrap forwardedAs={LinkComponent} state={rootState}>
              <Branding projectName={config && config.project.name} />
            </StateLinkWrap>
          </Box>
        )}

        <Flex gap={2} align="center">
          {shouldRender.statusContainer && <SanityStatusContainer />}

          {shouldRender.hints && <Box>{sidecar && createElement(sidecar.SidecarToggleButton)}</Box>}

          <LegacyLayerProvider zOffset="navbarPopover">
            <PresenceMenu collapse={shouldRender.collapsedPresenceMenu} maxAvatars={4} />
          </LegacyLayerProvider>

          {shouldRender.tools && (
            <LegacyLayerProvider zOffset="navbarPopover">
              <LoginStatus onLogout={onUserLogout} />
            </LegacyLayerProvider>
          )}

          {shouldRender.searchFullscreen && (
            <Button
              aria-label="Open search"
              onClick={handleToggleSearchOpen}
              icon={SearchIcon}
              mode="bleed"
              ref={setSearchButtonElement}
            />
          )}
        </Flex>
      </Flex>
    </Card>
  )
}
