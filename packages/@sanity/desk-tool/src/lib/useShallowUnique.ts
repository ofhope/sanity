import {useRef} from 'react'
import shallowEquals from 'shallow-equals'

export function useShallowUnique<ValueType>(value: ValueType): ValueType {
  const valueRef = useRef<ValueType>(value)

  if (!shallowEquals(valueRef.current, value)) {
    valueRef.current = value
  }

  return valueRef.current
}
