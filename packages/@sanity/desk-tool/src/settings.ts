import Observable from '@sanity/observable'
import settings from 'part:@sanity/base/settings'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

const deskToolSettings = settings.forNamespace('desk-tool')

export default deskToolSettings

export function useDeskToolSetting<ValueType>(
  namespace: string | null,
  key: string,
  defaultValue?: ValueType
): [ValueType | undefined, (_value: ValueType) => void] {
  const [value, setValue] = useState<ValueType | undefined>(defaultValue)
  const settingRef = useRef<{
    listen: (_defaultValue?: ValueType) => Observable<ValueType>
    set: (_value: ValueType) => void
  } | null>(null)

  useEffect(() => {
    const settingsNamespace = deskToolSettings.forNamespace(namespace)

    settingRef.current = settingsNamespace.forKey(key)

    const sub = settingRef.current.listen(defaultValue).subscribe(setValue)

    return () => sub.unsubscribe()
  }, [defaultValue, key, namespace])

  const set = useCallback((newValue: ValueType) => {
    setValue(newValue)
    settingRef.current?.set(newValue)
  }, [])

  return useMemo(() => [value, set], [set, value])
}
