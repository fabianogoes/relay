import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolve } from 'node:path'

import { parseCliArgs } from '../src/index.ts'

test('CLI inicia read-only e observa o cwd quando nenhuma flag e informada', () => {
  assert.deepEqual(parseCliArgs([], '/work/project'), {
    workspace: '/work/project',
    execEnabled: false,
  })
})

test('--exec habilita a superficie experimental', () => {
  assert.equal(parseCliArgs(['--exec'], '/work/project').execEnabled, true)
})

test('--no-exec vence --exec independentemente da ordem', () => {
  assert.equal(parseCliArgs(['--no-exec', '--exec'], '/work/project').execEnabled, false)
  assert.equal(parseCliArgs(['--exec', '--no-exec'], '/work/project').execEnabled, false)
})

test('--workspace resolve caminho relativo contra o cwd e preserva --port', () => {
  assert.deepEqual(parseCliArgs(['--workspace=../other', '--port=4312'], '/work/project'), {
    workspace: resolve('/work/project', '../other'),
    execEnabled: false,
    port: 4312,
  })
})
