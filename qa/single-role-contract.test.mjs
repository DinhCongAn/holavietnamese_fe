import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('auth state and login routing use one role string', () => {
  const auth = read('src/features/auth/context/AuthContext.jsx');
  const login = read('src/features/auth/pages/auth/LoginPage.jsx');
  const types = read('src/shared/api/authApi.types.ts');

  assert.match(types, /role: 'LEARNER' \| 'CONTENT' \| 'ADMIN'/);
  assert.doesNotMatch(types, /roles\?: string\[\]/);
  assert.match(auth, /role: normalizeRole\(role\)/);
  assert.match(auth, /const isContentManager = hasRole\('CONTENT'\)/);
  assert.doesNotMatch(auth, /user\.roles/);
  assert.match(login, /role === 'ADMIN'/);
  assert.match(login, /role === 'CONTENT'/);
  assert.doesNotMatch(login, /loggedUser\?\.roles/);
});

test('admin role update sends the backend single-role contract', () => {
  const service = read('src/features/admin/api/adminService.js');
  const list = read('src/features/admin/pages/AdminUsersPage.jsx');
  const detail = read('src/features/admin/pages/AdminUserDetailPage.jsx');

  assert.match(service, /put\(`\/api\/admin\/users\/\$\{id\}\/role`, \{ role \}\)/);
  assert.match(list, /const EDITABLE_ROLES = \['LEARNER', 'CONTENT'\]/);
  assert.match(list, /userRole !== 'ADMIN'/);
  assert.match(detail, /const canEditRole = isAdmin && userRole !== 'ADMIN'/);
  assert.doesNotMatch(list, /type="checkbox"/);
  assert.doesNotMatch(detail, /u\.roles/);
});

