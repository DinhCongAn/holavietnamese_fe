import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import axios from 'axios';
import { regionalDraft, regionalPayload } from '../src/features/explore/regional/models/RegionalVocabulary.js';
import { ROUTES } from '../src/constants/routes.js';

globalThis.__regionalImportContract = { axios };
globalThis.localStorage = { getItem: key => key === 'token' ? 'regional-import-test-token' : null };
const load = source => import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const clientSource = (await fs.readFile(new URL('../src/shared/api/axiosClient.js', import.meta.url), 'utf8'))
  .replace("import axios from 'axios';", 'const { axios } = globalThis.__regionalImportContract;')
  .replace('import.meta.env.VITE_API_BASE_URL', '({}).VITE_API_BASE_URL');
const { default: client } = await load(clientSource);
globalThis.__regionalImportContract.client = client;
const calls = [];
let result = { id: 9, region: 'SOUTH', word: 'Biến thể', variants: [] }, rejectEnvelope = false;
client.defaults.adapter = async config => {
  calls.push(config);
  assert.equal(config.headers.Authorization, 'Bearer regional-import-test-token');
  return { config, status: 200, statusText: 'OK', headers: {}, data: rejectEnvelope ? { code: 9999, message: 'Rejected operation' } : { code: 1000, result } };
};
const service = async file => load((await fs.readFile(new URL(file === 'contentImportService' ? `../src/features/content-import/api/${file}.js` : `../src/features/explore/regional/api/${file}.js`, import.meta.url), 'utf8'))
  .replace(/import axiosClient from [^;\n]+;?/, 'const axiosClient = globalThis.__regionalImportContract.client;'));
const { regionalVocabularyService, adminRegionalVocabularyService } = await service('regionalVocabularyService');
const { contentImportService } = await service('contentImportService');
const jobId = 'e7c658d0-7bc0-49d0-9ac0-221e5538d0ca';

test('Regional request validates identity and region and excludes server owned fields', () => {
  const payload = regionalPayload({ ...regionalDraft(), vocabularyId: '12', region: 'SOUTH', word: ' Thơm ', meaning: ' Trái dứa ', meaningEn: ' Pineapple ', exampleSentenceEn: ' I bought a pineapple. ', usageNoteEn: 'Southern usage.', status: 'PUBLISHED', id: 99, actorId: 42, createdAt: 'forged' });
  assert.equal(payload.vocabularyId, 12); assert.equal(payload.word, 'Thơm'); assert.equal(payload.meaning, 'Trái dứa');
  assert.equal(payload.meaningEn, 'Pineapple'); assert.equal(payload.exampleSentenceEn, 'I bought a pineapple.'); assert.equal(payload.usageNoteEn, 'Southern usage.');
  assert.equal(payload.pronunciation, null); assert.ok(!('id' in payload)); assert.ok(!('actorId' in payload));
  for (const override of [{ vocabularyId: '' }, { vocabularyId: '-1' }, { region: 'WEST' }, { word: ' ' }, { status: 'UNKNOWN' }])
    assert.throws(() => regionalPayload({ ...payload, ...override }));
});
test('Regional reads preserve filters, cancellation and publication decisions from the server', async () => {
  calls.length = 0; result = [{ vocabularyId: 12, word: 'Từ chuẩn', variants: [{ region: 'NORTH' }, { region: 'SOUTH' }] }];
  const controller = new AbortController();
  assert.deepEqual(await regionalVocabularyService.list({ keyword: 'Thơm', region: 'SOUTH', empty: '' }, { signal: controller.signal }), result);
  assert.deepEqual(calls[0].params, { keyword: 'Thơm', region: 'SOUTH' }); assert.equal(calls[0].signal, controller.signal);
  await regionalVocabularyService.get(12); assert.equal(calls[1].url, '/api/regional-vietnamese/12');
  await adminRegionalVocabularyService.list({ vocabularyId: 12, status: 'DRAFT' });
  assert.equal(calls[2].url, '/api/admin/regional-language'); assert.equal(calls[2].params.status, 'DRAFT');
});
test('Regional administration uses existing POST and PUT semantics and never deletes records', async () => {
  calls.length = 0; const payload = regionalPayload({ ...regionalDraft(), vocabularyId: 12, region: 'NORTH', word: 'Dứa', meaning: 'Pineapple' });
  await adminRegionalVocabularyService.create(payload); await adminRegionalVocabularyService.update(9, { ...payload, status: 'ARCHIVED' });
  assert.equal(calls[0].method, 'post'); assert.equal(calls[1].method, 'put'); assert.equal(calls[1].url, '/api/admin/regional-language/9');
  assert.equal(JSON.parse(calls[1].data).status, 'ARCHIVED');
  await assert.rejects(() => adminRegionalVocabularyService.update('undefined', payload));
});
test('Excel preview uploads the file with a browser multipart boundary and authenticated client', async () => {
  calls.length = 0; result = { id: jobId, status: 'READY', canConfirm: true, rows: [] };
  const file = new File(['xlsx-test-bytes'], 'vocabulary.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  assert.deepEqual(await contentImportService.preview('VOCABULARY', file), result);
  assert.equal(calls[0].url, '/api/admin/imports/preview'); assert.equal(calls[0].method, 'post');
  assert.ok(calls[0].data instanceof FormData); assert.equal(calls[0].data.get('module'), 'VOCABULARY');
  assert.equal(calls[0].data.get('file').name, 'vocabulary.xlsx');
  assert.ok(!String(calls[0].headers.get('Content-Type')).includes('application/json'));
  await assert.rejects(() => contentImportService.preview('VOCABULARY', new File([], 'empty.xlsx')));
  await assert.rejects(() => contentImportService.preview('VOCABULARY', new File(['x'], 'wrong.csv')));
});
test('Confirmation sends only stored job identity, and failures are not rewritten to success', async () => {
  calls.length = 0; result = { id: jobId, status: 'FAILED', success: false, importedRows: 0, errors: [{ row: 0, column: 'database' }] };
  assert.deepEqual(await contentImportService.confirm(jobId), result);
  assert.equal(calls[0].url, `/api/admin/imports/${jobId}/confirm`); assert.deepEqual(JSON.parse(calls[0].data), {});
  assert.equal((await contentImportService.confirm(jobId)).success, false);
  rejectEnvelope = true;
  try { await assert.rejects(() => contentImportService.types(), /Rejected operation/); await assert.rejects(() => regionalVocabularyService.list(), /Rejected operation/); }
  finally { rejectEnvelope = false; }
  await assert.rejects(() => contentImportService.confirm('../users'));
});
test('Import history keeps pagination and uses the persisted job detail endpoint', async () => {
  calls.length = 0; result = { content: [], totalPages: 0 };
  await contentImportService.history(3); assert.deepEqual(calls[0].params, { page: 3, size: 20 });
  await contentImportService.get(jobId); assert.equal(calls[1].url, `/api/admin/imports/${jobId}`);
  assert.equal(ROUTES.REGIONAL_VIETNAMESE, '/regional-vietnamese'); assert.equal(ROUTES.ADMIN_REGIONAL_LANGUAGE, '/admin/regional-language');
  const app = await fs.readFile(new URL('../src/app/router/AppRouter.jsx', import.meta.url), 'utf8');
  const adminRoutes = app.slice(app.indexOf('<Route element={<AdminRoute />}>'));
  for (const route of ['ADMIN_REGIONAL_LANGUAGE', 'ADMIN_IMPORT', 'ADMIN_IMPORT_HISTORY']) assert.ok(adminRoutes.includes(`path={ROUTES.${route}}`));
});
