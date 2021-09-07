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
            ref={ref}
            scheme="light"
            matchReferenceWidth
            {...popoverProps}
          />
        )
      }),
    []
  )

  const renderPopoverFullscreen = useCallback(
    (props, ref) => {
      if (!props.hidden && error) {
        return (
          <Portal>
            <Card
              padding={4}
              style={{position: 'absolute', inset: '0 0 0 0'}}
              tone="critical"
              scheme="light"
            >
              <Flex align="center" height="fill" justify="center">
                <Text align="center" muted>
                  Something went wrong while searching
                </Text>
              </Flex>
            </Card>
          </Portal>
        )
      }

      if (!props.hidden && searchString && !loading && hits.length === 0) {
        return (
          <Portal>
            <Card
              padding={4}
              style={{position: 'absolute', inset: '0 0 0 0'}}
              tone="critical"
              scheme="light"
            >
              <Flex align="center" height="fill" justify="center">
                <Text align="center" muted>
                  No results for <strong>‘{searchString}’</strong>
                </Text>
              </Flex>
            </Card>
          </Portal>
        )
      }

      return (
        <Portal>
          <Card
            hidden={props.hidden}
            ref={ref}
            scheme="light"
            style={{position: 'absolute', inset: '0 0 0 0'}}
          >
            {props.content}
          </Card>
        </Portal>
      )
    },
    [error, loading, hits, searchString]
  )

  const renderPopover = useCallback(
    (props, ref) => {
      if (props.hidden && error) {
        return (
          <PopoverContent
            open={props.hidden}
            referenceElement={props.inputElement}
            ref={ref}
            content={
              <Box padding={4}>
                <Flex align="center" height="fill" justify="center" style={{minHeight: 100}}>
                  <Text align="center" muted>
                    Something went wrong while searching
                  </Text>
                </Flex>
              </Box>
            }
          />
        )
      }

      if (props.hidden && searchString && !loading && hits.length === 0) {
        return (
          <PopoverContent
            open={props.hidden}
            referenceElement={props.inputElement}
            ref={ref}
            content={
              <Box padding={4}>
                <Flex align="center" height="fill" justify="center" style={{minHeight: 100}}>
                  <Text align="center" muted>
                    No results for <strong>‘{searchString}’</strong>
                  </Text>
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
        listBox={{padding: 2}}
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
