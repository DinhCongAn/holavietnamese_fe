import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../src/features/admin/pages/AdminAuditLogsPage.jsx', import.meta.url), 'utf8');
const fixture = readFileSync(new URL('./fixtureAxios.js', import.meta.url), 'utf8');

test('admin audit log renders the backend actor and timestamp contract', () => {
  assert.match(page, /log\.adminUsername/);
  assert.match(page, /log\.createdAt/);
  assert.match(page, /dateTime=\{log\.createdAt \|\| log\.time\}/);
  assert.match(fixture, /adminUsername:'admin\.qa'/);
  assert.match(fixture, /action:'UPDATE_COURSE'/);
});
