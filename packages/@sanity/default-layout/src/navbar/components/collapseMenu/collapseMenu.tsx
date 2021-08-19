import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactElement,
  Children,
  cloneElement,
} from 'react'
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  Text,
  Tooltip,
  useElementRect,
  ThemeColorSchemeKey,
} from '@sanity/ui'
import styled from 'styled-components'
import {InView} from 'react-intersection-observer'
import {EllipsisVerticalIcon} from '@sanity/icons'
import {CollapseMenuDivider, CollapseMenuButton} from '.'

interface CollapseMenuProps {
  children: React.ReactNode
  menuButton?: ReactElement<HTMLButtonElement>
  gap?: number | number[]
  onMenuVisible?: (hide: boolean) => void
  popoverScheme?: ThemeColorSchemeKey
}

const Root = styled(Box)<{$hide?: boolean}>`
  position: relative;
  white-space: nowrap;
  width: 100%;
  overflow: hidden;
  border-radius: inherit;
`

const Inner = styled(Flex)<{$hide?: boolean}>`
  position: ${({$hide}) => ($hide ? 'absolute' : 'static')};
  width: ${({$hide}) => ($hide ? 'max-content' : 'auto')};
  visibility: ${({$hide}) => ($hide ? 'hidden' : 'visible')};
  pointer-events: ${({$hide}) => ($hide ? 'none' : 'inherit')};
  opacity: ${({$hide}) => ($hide ? 0 : 1)};
  left: 0;
  top: 0;
`

const OptionBox = styled(Box)`
  list-style: none;
  flex-shrink: 0;
  white-space: nowrap;
  display: flex;
`

export function CollapseMenu(props: CollapseMenuProps) {
  const {children, menuButton, gap = 1, onMenuVisible, popoverScheme} = props

  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null)
  const [expandedRef, setExpandedRef] = useState<HTMLDivElement | null>(null)
  const [collapsedInnerRef, setCollapsedInnerRef] = useState<HTMLDivElement | null>(null)
  const [collapsed, setCollapsed] = useState<boolean>(true)
  const [menuOptions, setMenuOptions] = useState<ReactElement[] | []>([])
  const rootRect = useElementRect(rootRef)
  const childrenArray = Children.toArray(children) as ReactElement[]

  //we need to do this filtering to get the latest state of menu options
  const menuOptionsArray = childrenArray.filter(({key}) =>
    menuOptions.find((o: ReactElement) => o.key === key)
  )

  const hidden = menuOptions.length > 0

  useEffect(() => {
    if (onMenuVisible) {
      onMenuVisible(hidden)
    }
  }, [hidden, onMenuVisible])

  // Pick what button to render as menu button
  const _menuButton = useMemo(() => {
    if (menuButton) {
      return menuButton
    }
    return <Button mode="bleed" icon={EllipsisVerticalIcon} />
  }, [menuButton])

  // Add or remove option in menuOptions
  const handleInViewChange = useCallback(
    (payload: {child: ReactElement; inView: boolean}) => {
      const {child, inView} = payload
      const exists = menuOptions.some((o: ReactElement) => o.key === child.key)

      if (!inView && !exists) {
        setMenuOptions((prev) => [child, ...prev])
      }

      if (inView && exists) {
        const updatedOptions = menuOptions.filter(({key}) => key !== child.key)
        setMenuOptions(updatedOptions)
      }
    },
    [menuOptions]
  )

  //Check if child is in menu
  const isInMenu = useCallback(
    (option) => {
      const exists = menuOptions.some(({key}) => key === option.key)
      return exists
    },
    [menuOptions]
  )

  //Check if menu should collapse
  useEffect(() => {
    if (rootRect && expandedRef) {
      const collapse = rootRect.width < expandedRef.scrollWidth
      setCollapsed(collapse)
    }
  }, [expandedRef, rootRect])

  return (
    <Root ref={setRootRef} display="flex" data-ui="CollapseMenu">
      {/* Expanded row */}
      <Inner ref={setExpandedRef} $hide={collapsed} aria-hidden={collapsed}>
        <Flex as="ul" gap={gap}>
          {childrenArray.map((child) => {
            return (
              <Box as="li" key={child.key}>
                {cloneElement(child, {...child.props}, null)}
              </Box>
            )
          })}
        </Flex>
      </Inner>

      {/* Collapsed row */}
      <Inner gap={gap} $hide={!collapsed} aria-hidden={!collapsed}>
        <Flex ref={setCollapsedInnerRef} gap={gap} as="ul">
          {childrenArray.map((child) => {
            if (child.type === CollapseMenuDivider) {
              return child
            }

            if (child.type !== CollapseMenuButton) {
              return child
            }

            return (
              <InView
                // eslint-disable-next-line react/jsx-no-bind
                onChange={(inView) => handleInViewChange({inView, child: child})}
                root={collapsedInnerRef}
                key={child.key}
                threshold={1}
                rootMargin="0px 2px 0px 0px"
                aria-hidden={isInMenu(child.key)}
              >
                {({ref, inView}) => (
                  <OptionBox
                    ref={ref}
                    as="li"
                    style={{
                      visibility: inView && collapsed ? 'visible' : 'hidden',
                      pointerEvents: inView && collapsed ? 'inherit' : 'none',
                    }}
                  >
                    <Tooltip
                      portal
                      scheme="light"
                      disabled={!inView}
                      content={
                        <Box padding={2} sizing="border">
                          <Text size={1} muted>
                            {child.props.text}
                          </Text>
                        </Box>
                      }
                    >
                      <Box>
                        {cloneElement(
                          child,
                          {
                            ...child.props,
                            text: null,
                            'aria-label': child.props.text,
                            disabled: !inView,
                          },
                          null
                        )}
                      </Box>
                    </Tooltip>
                  </OptionBox>
                )}
              </InView>
            )
          })}
        </Flex>
      </Inner>

      {/* Menu */}
      {collapsed && menuOptionsArray.length > 0 && (
        <MenuButton
          button={_menuButton}
          id="collapse-menu"
          popoverScheme={popoverScheme}
          menu={
            <Menu shouldFocus="first">
              {menuOptionsArray.map((child) => {
                return (
                  <MenuItem
                    {...child.props}
                    key={child?.key}
                    fontSize={2}
                    radius={2}
                    selected={false}
                    pressed={child.props.selected}
                  />
                )
              })}
            </Menu>
          }
          placement="bottom"
          popover={{portal: true, preventOverflow: true}}
        />
      )}
    </Root>
  )
}
