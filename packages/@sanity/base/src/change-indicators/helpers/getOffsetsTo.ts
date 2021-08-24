import {Rect} from '../overlay/types'
import {hasOverflowScroll} from './scrollUtils'

export const getOffsetsTo = (
  source: HTMLElement,
  target: HTMLElement
): {rect: Rect; bounds: Rect} => {
  const bounds: {top: number; height: number; left: number; width: number} = {
    top: 0,
    left: 0,
    height: target.offsetHeight, // Number.MAX_SAFE_INTEGER,
    width: target.offsetWidth, // Number.MAX_SAFE_INTEGER,
  }

  let top = 0
  let left = 0
  let foundScrollContainer = false
  let el: HTMLElement | null = source

  while (el && el !== target) {
    if (foundScrollContainer) {
      bounds.top += el.offsetTop
      bounds.left += el.offsetLeft
    }

    if (hasOverflowScroll(el)) {
      bounds.top = el.offsetTop
      bounds.height = el.offsetHeight
      bounds.left = el.offsetLeft
      bounds.width = el.offsetWidth

      foundScrollContainer = true
    }

    top += el.offsetTop - el.scrollTop
    left += el.offsetLeft - el.scrollLeft
    el = el.offsetParent as HTMLElement
  }

  const rect = {
    top,
    left,
    height: source.offsetHeight,
    width: source.offsetWidth,
  }

  return {rect, bounds}
}
