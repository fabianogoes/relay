import { spawn, execFileSync, type ChildProcess } from 'node:child_process'
import { closeSync, constants as C, openSync, readSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

export type RunStatus = 'running' | 'exited'

export interface RunInfo {
  runId: string
  status: RunStatus
  exitCode: number | null
  startedAt: string
}

export interface PtyHandle {
  runId: string
  status(): RunStatus
  exitCode(): number | null
  startedAt(): string
  write(data: string): void
  terminate(): void
  scrollback(): string
  onData(cb: (chunk: string) => void): () => void
  onExit(cb: (code: number | null) => void): () => void
}

const SCRATCH = join(tmpdir(), 'relay-run')

function scriptBinary(): string | null {
  if (process.platform !== 'darwin') return null
  try {
    execFileSync('command', ['-v', 'script'], { stdio: 'ignore' })
    return 'script'
  } catch {
    return null
  }
}

export function ptyAvailable(): boolean {
  return scriptBinary() !== null
}

export interface StartRunOptions {
  bin: string
  args: string[]
  cwd: string
}

export function startPtyRun(options: StartRunOptions): PtyHandle {
  const runId = randomUUID()
  const dir = join(SCRATCH, runId)
  execFileSync('mkdir', ['-p', dir])
  const fifo = join(dir, 'out.pipe')
  try {
    execFileSync('mkfifo', [fifo])
  } catch {
    // fifo já existe
  }

  let scrollback = ''
  let exited = false
  let exitCode: number | null = null
  const startedAt = new Date().toISOString()
  const dataCbs = new Set<(chunk: string) => void>()
  const exitCbs = new Set<(code: number | null) => void>()

  // `script -q -e -F <fifo> -- <bin> <args...>` aloca um PTY para o comando,
  // grava o fluxo no fifo e propaga o exit code do comando (`-e`).
  const child: ChildProcess = spawn(
    'script',
    ['-q', '-e', '-F', fifo, '--', options.bin, ...options.args],
    { cwd: options.cwd, stdio: ['pipe', 'ignore', 'ignore'] },
  )

  let readerFd = -1
  let readerTimer: NodeJS.Timeout | null = null

  const openFifo = (): boolean => {
    if (readerFd >= 0) return true
    try {
      readerFd = openSync(fifo, C.O_RDONLY | C.O_NONBLOCK)
      return true
    } catch {
      return false
    }
  }

  readerTimer = setInterval(() => {
    if (!openFifo()) return
    let keep = true
    while (keep) {
      try {
        const buf = Buffer.alloc(4096)
        const n = readSync(readerFd, buf, 0, 4096, null)
        if (n > 0) {
          const chunk = buf.subarray(0, n).toString('utf8')
          scrollback += chunk
          for (const cb of dataCbs) cb(chunk)
        }
        if (n < 4096) keep = false
      } catch (e) {
        keep = false
        const code = (e as NodeJS.ErrnoException).code
        if (code === 'EBADF') readerFd = -1
      }
    }
  }, 16)

  child.on('close', (code) => {
    if (readerTimer) clearInterval(readerTimer)
    if (readerFd >= 0) {
      try {
        closeSync(readerFd)
      } catch {
        // já fechado
      }
      readerFd = -1
    }
    exited = true
    exitCode = code
    for (const cb of exitCbs) cb(code)
  })

  return {
    runId,
    status: () => (exited ? 'exited' : 'running'),
    exitCode: () => exitCode,
    startedAt: () => startedAt,
    write(data: string): void {
      if (!child.stdin || child.stdin.destroyed) return
      child.stdin.write(data)
    },
    terminate(): void {
      if (!exited) child.kill('SIGHUP')
    },
    scrollback: () => scrollback,
    onData(cb) {
      dataCbs.add(cb)
      return () => dataCbs.delete(cb)
    },
    onExit(cb) {
      exitCbs.add(cb)
      return () => exitCbs.delete(cb)
    },
  }
}
