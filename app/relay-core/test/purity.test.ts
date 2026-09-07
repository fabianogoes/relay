import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = fileURLToPath(new URL('../src', import.meta.url))

test('relay-core não importa módulos node:* nem relay-host', () => {
  const files = readdirSync(SRC).filter((f) => f.endsWith('.ts'))
  assert.ok(files.length > 0, 'src/ vazio')
  for (const file of files) {
    const content = readFileSync(join(SRC, file), 'utf8')
    const nodeImports = [...content.matchAll(/from\s+['"](node:[^'"]+)['"]/g)].map((m) => m[1])
    assert.deepEqual(nodeImports, [], `${file} importa módulo node:*`)
    assert.ok(!/relay-host/.test(content), `${file} referencia relay-host`)
  }
})
