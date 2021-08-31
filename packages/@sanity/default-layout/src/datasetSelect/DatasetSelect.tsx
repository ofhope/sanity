// @todo: remove the following line when part imports has been removed from this file
///<reference types="@sanity/types/parts" />

import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Subscription} from 'rxjs'
import {withRouterHOC} from 'part:@sanity/base/router'
import {map} from 'rxjs/operators'
import {Select} from '@sanity/ui'
import {state as urlState} from '../datastores/urlState'
import {CONFIGURED_SPACES} from '../util/spaces'

interface Props {
  router: {
    navigate: (state: {space: string}) => void
  }
}

export const DatasetSelect = withRouterHOC((props: Props) => {
  const [currentSpace, setCurrentSpace] = useState<{name: string} | null>(null)
  const currentSpaceSubscription: React.MutableRefObject<Subscription | undefined> = useRef()

  const currentSpace$ = urlState.pipe(
    map((event) => event.state && event.state.space),
    map((spaceName) => CONFIGURED_SPACES.find((sp) => sp.name === spaceName))
  )

  useEffect(() => {
    currentSpaceSubscription.current = currentSpace$.subscribe((space) => {
      setCurrentSpace(space)
    })

    return () => {
      currentSpaceSubscription.current.unsubscribe()
    }
  }, [currentSpace$])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      props.router.navigate({space: event.target.value})
      window.location.reload()
    },
    [props.router]
  )

  return (
    <Select
      onChange={handleChange}
      value={(currentSpace && currentSpace.name) || undefined}
      radius={2}
    >
      {CONFIGURED_SPACES.map((space) => (
        <option key={space.name} value={space.name}>
          {space.title}
        </option>
      ))}
    </Select>
  )
})
