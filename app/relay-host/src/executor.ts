import { startPtyRun, ptyAvailable, type PtyHandle } from './pty.ts'
import { startDiskTracker, type DiskTracker, type DiskEntry } from './disk.ts'
import type { LaunchPlan } from './harness.ts'

export interface EmbeddedRun {
  runId: string
  plan: LaunchPlan
  handle: PtyHandle
  processName: string
  disk: DiskTracker
}

interface ExecutorEvents {
  runStarted(run: EmbeddedRun): void
  runExited(run: EmbeddedRun, code: number | null): void
}

const running = new Set<EmbeddedRun>()

export const executorEvents: ExecutorEvents = {
  runStarted(_run: EmbeddedRun): void {},
  runExited(_run: EmbeddedRun, _code: number | null): void {},
}

function processName(plan: LaunchPlan): string {
  const skill = plan.prompt.match(/\/(\w[\w-]*)/)?.[1] ?? plan.prompt.split(/\s+/)[0] ?? plan.bin
  return `${plan.bin} · ${skill}`
}

export function canEmbed(): boolean {
  return ptyAvailable()
}

export function startExec(plan: LaunchPlan): EmbeddedRun | null {
  if (!ptyAvailable()) return null
  const handle = startPtyRun({ bin: plan.bin, args: plan.args, cwd: plan.cwd })
  const disk = startDiskTracker(plan.cwd)
  const run: EmbeddedRun = { runId: handle.runId, plan, handle, processName: processName(plan), disk }
  running.add(run)
  handle.onExit((code) => {
    running.delete(run)
    executorEvents.runExited(run, code)
  })
  executorEvents.runStarted(run)
  return run
}

export function getRun(runId: string): EmbeddedRun | null {
  for (const run of running) if (run.runId === runId) return run
  return null
}

export function listRuns(): EmbeddedRun[] {
  return [...running]
}

export function listActiveRuns(): EmbeddedRun[] {
  return [...running]
}

export function terminateRun(runId: string): void {
  getRun(runId)?.handle.terminate()
}

export function runningCount(): number {
  return running.size
}
