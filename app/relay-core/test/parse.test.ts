import { test } from 'node:test'
import assert from 'node:assert/strict'

import { parseChangelog } from '../src/parse.ts'

test('parseChangelog extrai data, titulo e evidencia (com continuacao) do cabecalho e dos campos', () => {
  const text = `# Change log

## 2026-09-10 - T-002 - Tornar spec coerente
- Backlog: B-031
- Spec: .specs/20260910-001-observador-read-only.md
- Result: breve.
- Evidence: primeira linha
  segunda linha continuada.
- Criteria: A-004, A-005

## 2026-09-04 - T-001 - Descoberta de raiz
- Backlog: B-001
- Spec: .specs/20260905-001-protocolo-leitor.md
- Result: breve.
- Evidence: vitest 8/8
- Criteria: none
`
  const records = parseChangelog(text)
  assert.equal(records.length, 2)
  assert.deepEqual(records[0], {
    date: '2026-09-10',
    todoId: 'T-002',
    title: 'Tornar spec coerente',
    backlogId: 'B-031',
    spec: '.specs/20260910-001-observador-read-only.md',
    evidence: 'primeira linha segunda linha continuada.',
    criteria: ['A-004', 'A-005'],
  })
  assert.equal(records[1].date, '2026-09-04')
  assert.equal(records[1].title, 'Descoberta de raiz')
  assert.equal(records[1].evidence, 'vitest 8/8')
})
