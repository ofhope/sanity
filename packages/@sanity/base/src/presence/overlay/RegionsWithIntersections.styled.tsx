import styled, {css} from 'styled-components'
import {WithIntersection} from './WithIntersection'

interface styleProps {
  debug: boolean
  margins?: [number, number, number, number]
}

export const RootWrapper = styled.div`
  position: relative;
`

export const OverlayWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 13;
`

export const RegionWrapper = css`
  overflow: hidden;
  pointer-events: none;
  position: absolute;
`

export const TopRegionWrapper = styled(WithIntersection)(({debug, margins}: styleProps) => {
  return css`
    ${RegionWrapper}

    z-index: 100;
    position: sticky;
    height: 1px;
    top: ${margins[0] - 1}px;
    background-color: ${debug ? 'red' : 'none'};
  `
})

export const MiddleRegionWrapper = styled(WithIntersection)(({debug}: styleProps) => {
  return css`
    ${RegionWrapper}

    visibility: none;

    ${debug &&
    css`
      background: rgba(255, 0, 0, 0.25);
      outline: 1px solid #00b;
      visibility: visible;
    `}
  `
})

export const BottomRegionWrapper = styled(WithIntersection)(({debug}: styleProps) => {
  return css`
    ${RegionWrapper}

    position: sticky;
    bottom: -1px;
    height: 1px;
    background-color: ${debug ? 'blue' : 'transparent'};
  `
})
