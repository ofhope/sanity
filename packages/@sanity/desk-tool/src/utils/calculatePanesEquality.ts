import {isEqual} from 'lodash'
import {PaneNode} from '../types'

export const calculatePanesEquality = (prev: PaneNode[][] = [], next: PaneNode[][] = []) => {
  if (prev === next) {
    return {ids: true, params: true}
  }

  if (prev.length !== next.length) {
    return {ids: false, params: false}
  }

  let paramsDiffer = false
  const idsEqual = prev.every((prevGroup, index) => {
    const nextGroup = next[index]
    if (prevGroup.length !== nextGroup.length) {
      return false
    }

    return prevGroup.every((prevPane, paneIndex) => {
      const nextPane = nextGroup[paneIndex]

      paramsDiffer =
        paramsDiffer ||
        !isEqual(nextPane.params, prevPane.params) ||
        !isEqual(nextPane.payload, prevPane.payload)

      return nextPane.id === prevPane.id
    })
  })

  return {ids: idsEqual, params: !paramsDiffer}
}
