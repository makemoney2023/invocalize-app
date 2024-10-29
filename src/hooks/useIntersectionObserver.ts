import { useEffect, useRef } from 'react'

export function useIntersectionObserver<T extends HTMLElement>(
  callback: () => void,
  options: IntersectionObserverInit = { threshold: 0.1 }
): React.RefObject<T> {
  const observerRef = useRef<T>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback()
      }
    }, options)

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current)
      }
    }
  }, [callback, options])

  return observerRef
}
