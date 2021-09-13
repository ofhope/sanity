import {Box, Flex, rem, Stack} from '@sanity/ui'
import styled from 'styled-components'

export const Root = styled(Flex)`
  user-select: none;
  height: 5em;
  box-sizing: border-box;
  max-width: 100%;
  position: relative;
`

export const Top = styled(Flex)`
  min-width: 0;
`

export const Header = styled(Stack)`
  min-width: 0;
`

export const MediaWrapper = styled(Flex)`
  width: 5em;
  height: 5em;
  position: relative;
  border-radius: ${({theme}) => rem(theme.sanity.radius[2])};

  /* img {
    display: block;
    width: 5em;
    height: 5em;
    object-fit: contain;
  }

  svg {
    font-size: 3rem;
    color: inherit;
  } */

  & img {
    display: block;
    position: absolute;
    inset: 0;
    object-fit: contain;
    border-radius: inherit;
    width: 100%;
    height: 100%;
  }

  & svg {
    display: block;
    font-size: calc(37 / 16 * 1em);

    &[data-sanity-icon] {
      font-size: calc(51 / 16 * 1em);
    }
  }

  & img + span {
    display: block;
    position: absolute;
    inset: 0 0 0 0;
    box-shadow: inset 0 0 0 1px var(--card-fg-color);
    opacity: 0.2;
    border-radius: inherit;
  }
`

export const MediaString = styled(Box)``

export const StatusWrapper = styled(Box)`
  white-space: nowrap;
`

export const Content = styled(Flex)`
  flex-grow: 1;
  min-width: 0;

  > * {
    min-width: 0;
  }
`
