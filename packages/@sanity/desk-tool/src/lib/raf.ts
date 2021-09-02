export function raf(fn: () => void): () => void {
  const frameId = requestAnimationFrame(fn)

  return () => {
    cancelAnimationFrame(frameId)
  }
}

export function raf2(fn: () => void): () => void {
  let innerDispose: (() => void) | null = null

  const outerDispose = raf(() => {
    innerDispose = raf(fn)
  })

  return () => {
    if (innerDispose) innerDispose()

    outerDispose()
  }
}
