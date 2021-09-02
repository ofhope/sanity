import {isEqual} from 'lodash'
import {useRef} from 'react'

export function useUnique<ValueType>(value: ValueType): ValueType {
  const valueRef = useRef<ValueType>(value)

  if (!isEqual(valueRef.current, value)) {
    valueRef.current = value
  }

  return valueRef.current
}
