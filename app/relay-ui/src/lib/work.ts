export interface SpecRef {
  id: string
}

export function reconcileSpecId(specs: SpecRef[], currentId: string | null): string | null {
  if (currentId !== null && specs.some((s) => s.id === currentId)) return currentId
  return specs.length > 0 ? specs[0].id : null
}

export interface LatestRequest {
  signal: AbortSignal
  revision: number
}

export interface LatestRequestTracker {
  start(): LatestRequest
  isCurrent(revision: number): boolean
}

export function createLatestRequest(): LatestRequestTracker {
  let controller: AbortController | null = null
  let revision = 0

  return {
    start(): LatestRequest {
      controller?.abort()
      controller = new AbortController()
      revision += 1
      return { signal: controller.signal, revision }
    },
    isCurrent(candidate: number): boolean {
      return candidate === revision
    },
  }
}
