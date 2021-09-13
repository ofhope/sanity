import React, {forwardRef, useCallback, useMemo} from 'react'
import {
  Text,
  Flex,
  useGlobalKeyDown,
  Autocomplete,
  Popover,
  Box,
  Card,
  PortalProvider,
  Portal,
  PopoverProps,
  CardProps,
} from '@sanity/ui'
import {SearchIcon} from '@sanity/icons'
import styled from 'styled-components'
import {SearchItem, useSearch} from '.'

const ResultsPopover = styled(Popover)`
  & > div {
    min-height: 43px;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }

  &[data-popper-reference-hidden='true'] {
    display: none;
  }
`

const FullscreenContentCard = styled(Card)`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`

const StyledText = styled(Text)`
  word-break: break-word;
`

export function SearchField({
  portalElement,
  fullScreen,
  inputElement,
}: {
  portalElement: HTMLDivElement | null
  fullScreen: boolean
  inputElement: (el: HTMLInputElement | null) => void
}) {
  const {handleSearch, handleClearSearch, searchState} = useSearch()
  const {hits, loading, searchString, error} = searchState

  useGlobalKeyDown((e) => {
    if (e.key === 'Escape' && searchString?.length > 0) {
      handleClearSearch()
    }
  })

  const filterOption = useCallback(() => true, [])

  const renderOption = useCallback(
    (option) => {
      const {data} = option.payload
      return <SearchItem data={data} key={data.hit._id} onClick={handleClearSearch} padding={2} />
    },
    [handleClearSearch]
  )

  const FullscreenContent = useMemo(
    () =>
      // eslint-disable-next-line no-shadow
      forwardRef(function LinkComponent(
        cardProps: CardProps & {children: React.ReactNode; hidden?: boolean},
        ref: React.ForwardedRef<HTMLDivElement>
      ) {
        return (
          <Portal>
            <FullscreenContentCard ref={ref} scheme="light" {...cardProps} />
          </Portal>
        )
      }),
    []
  )

  const renderPopoverFullscreen = useCallback(
    (props, ref) => {
      if (!props.hidden && error) {
        return (
          <FullscreenContent tone="critical">
            <Flex align="center" height="fill" justify="center" padding={4} sizing="border">
              <StyledText align="center" muted>
                {error.message}
              </StyledText>
            </Flex>
          </FullscreenContent>
        )
      }

      if (!props.hidden && searchString && !loading && hits.length === 0) {
        return (
          <FullscreenContent>
            <Flex align="center" height="fill" justify="center" padding={4} sizing="border">
              <StyledText align="center" muted>
                No results for <strong>‘{searchString}’</strong>
              </StyledText>
            </Flex>
          </FullscreenContent>
        )
      }

      return (
        <FullscreenContent hidden={props.hidden} ref={ref} overflow="auto">
          {props.content}
        </FullscreenContent>
      )
    },
    [error, searchString, loading, hits, FullscreenContent]
  )

  const PopoverContent = useMemo(
    () =>
      // eslint-disable-next-line no-shadow
      forwardRef(function LinkComponent(
        popoverProps: PopoverProps,
        ref: React.ForwardedRef<HTMLDivElement>
      ) {
        return (
          <ResultsPopover
            portal
            placement="bottom"
            arrow={false}
            constrainSize
            radius={2}
            ref={ref}
            scheme="light"
            matchReferenceWidth
            {...popoverProps}
          />
        )
      }),
    []
  )

  const renderPopover = useCallback(
    (props, ref) => {
      if (!props.hidden && error) {
        return (
          <PopoverContent
            open={!props.hidden}
            referenceElement={props.inputElement}
            ref={ref}
            content={
              <Box padding={4}>
                <Flex align="center" height="fill" justify="center">
                  <StyledText align="center" muted>
                    {error?.message || 'Something went wrong while searching'}
                  </StyledText>
                </Flex>
              </Box>
            }
          />
        )
      }

      if (!props.hidden && searchString && !loading && hits.length === 0) {
        return (
          <PopoverContent
            open={!props.hidden}
            referenceElement={props.inputElement}
            ref={ref}
            content={
              <Box padding={4}>
                <Flex align="center" height="fill" justify="center">
                  <StyledText align="center" muted>
                    No results for <strong>‘{searchString}’</strong>
                  </StyledText>
                </Flex>
              </Box>
            }
          />
        )
      }

      if (!props.hidden && hits.length > 0) {
        return (
          <PopoverContent
            open={!props.hidden}
            referenceElement={props.inputElement}
            ref={ref}
            content={props.content}
          />
        )
      }

      return undefined
    },
    [error, searchString, loading, hits, PopoverContent]
  )

  const autoComplete = useMemo(
    () => (
      <Autocomplete
        icon={SearchIcon}
        key="studio-search"
        id="studio-search"
        listBox={fullScreen ? {padding: 2} : undefined}
        loading={loading}
        onQueryChange={handleSearch}
        options={hits.map((hit) => {
          return {
            value: hit.hit._id,
            payload: {
              data: hit,
            },
          }
        })}
        placeholder="Search"
        radius={2}
        ref={inputElement}
        filterOption={filterOption}
        renderOption={renderOption}
        renderPopover={fullScreen ? renderPopoverFullscreen : renderPopover}
      />
    ),
    [
      filterOption,
      fullScreen,
      handleSearch,
      hits,
      inputElement,
      loading,
      renderOption,
      renderPopover,
      renderPopoverFullscreen,
    ]
  )

  if (fullScreen) {
    return <PortalProvider element={portalElement}>{autoComplete}</PortalProvider>
  }

  return <PortalProvider element={null}>{autoComplete}</PortalProvider>
}
