import React from 'react'
import {tap} from 'rxjs/operators'
import type {ObservableIntersectionObserver} from './intersectionObserver'

export interface WithIntersectionProps extends React.ComponentProps<'div'> {
  onIntersection: (id, IntersectionObserverEntry) => void
  io: ObservableIntersectionObserver
  id: string
}
export const WithIntersection = (props: WithIntersectionProps) => {
  const {onIntersection, io, id, ...rest} = props
  const element = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    const el = element.current
    if (!el) return undefined
    const subscription = io
      .observe(el)
      .pipe(tap((entry) => onIntersection(id, entry)))
      .subscribe()
    return () => subscription.unsubscribe()
  }, [io, id, onIntersection])
  return <div ref={element} {...rest} />
}
