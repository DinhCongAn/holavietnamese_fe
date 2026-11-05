import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import axios from 'axios';
import { matchRoutes } from 'react-router-dom';
import { ROUTES } from '../src/constants/routes.js';
import { destinationDraft, destinationPayload, DESTINATION_STATUSES } from '../src/features/explore/models/Destination.js';

const storage = new Map([['token', 'destination-contract-token']]);
const redirects = [], calls = [], entries = [];
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, removeItem: key => storage.delete(key) };
globalThis.window = { location: { pathname: '/admin/destinations', search: '', assign: path => redirects.push(path) } };
globalThis.__destinationContract = { axios };
const load = source => import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const { default: client } = await load((await fs.readFile(new URL('../src/shared/api/axiosClient.js', import.meta.url), 'utf8'))
  .replace("import axios from 'axios';", 'const { axios } = globalThis.__destinationContract;')
  .replace('import.meta.env.VITE_API_BASE_URL', '({}).VITE_API_BASE_URL'));
globalThis.__destinationContract.client = client;
const { destinationService, adminDestinationService } = await load((await fs.readFile(new URL('../src/features/explore/api/destinationService.js', import.meta.url), 'utf8'))
  .replace(/import axiosClient from [^;]+;/, 'const axiosClient = globalThis.__destinationContract.client;'));
let failureStatus = null, envelopeFailure = false;
function reject(config, status, message) {
  throw new axios.AxiosError(message, 'ERR_BAD_RESPONSE', config, null, { status, data: { code: status, message } });
}
client.defaults.adapter = async config => {
  const body = config.data ? JSON.parse(config.data) : undefined;
  calls.push({ method: config.method, url: config.url, params: config.params, body, signal: config.signal, token: config.headers.Authorization });
  if (failureStatus) reject(config, failureStatus, 'Destination request rejected.');
  const admin = config.url.startsWith('/api/admin/');
  const id = config.url.match(/\/(\d+)$/)?.[1];
  let result;
  if (config.method === 'post' || config.method === 'put') {
    if (entries.some(item => item.slug === body.slug.trim().toLowerCase() && String(item.id) !== id)) reject(config, 409, 'Destination slug already exists.');
    const current = id ? entries.find(item => String(item.id) === id) : null;
    result = { ...current, ...body, slug: body.slug.trim().toLowerCase(), id: current?.id ?? entries.length + 1, createdAt: current?.createdAt ?? '2026-10-09T00:00:00Z', updatedAt: '2026-10-09T01:00:00Z' };
    if (result.status === 'PUBLISHED') result.publishedAt ??= '2026-10-09T01:00:00Z';
    if (result.status === 'ARCHIVED') result.archivedAt ??= '2026-10-09T02:00:00Z';
    if (current) entries.splice(entries.indexOf(current), 1, result); else entries.push(result);
  } else if (id) {
    result = entries.find(item => String(item.id) === id && (admin || item.status === 'PUBLISHED'));
    if (!result) reject(config, 404, 'Destination not found.');
  } else {
    result = entries.filter(item => (admin || item.status === 'PUBLISHED')
      && (!config.params?.keyword || (item.nameVi + ' ' + item.nameEn).toLowerCase().includes(config.params.keyword.toLowerCase()))
      && (!config.params?.region || item.region === config.params.region)
      && (!config.params?.status || item.status === config.params.status));
  }
  return { config, status: config.method === 'post' ? 201 : 200, statusText: 'OK', headers: {}, data: envelopeFailure ? { code: 9999, success: false, message: 'Save rejected.' } : { code: 1000, success: true, result } };
};

const draft = { ...destinationDraft(), nameVi: ' Hà Nội ', nameEn: ' Hanoi ', slug: ' hanoi ', region: 'NORTH' };

test('DestinationRequest trims optional text and excludes every readonly property', () => {
  const payload = destinationPayload({ ...draft, id: 123, createdAt: 'old', updatedAt: 'old', publishedAt: 'old', archivedAt: 'old' });
  assert.deepEqual(payload, { nameVi: 'Hà Nội', nameEn: 'Hanoi', slug: 'hanoi', region: 'NORTH', shortDescriptionVi: null, shortDescriptionEn: null, descriptionVi: null, descriptionEn: null, imageUrl: null, status: 'DRAFT' });
  for (const key of ['nameVi', 'nameEn', 'slug']) assert.throws(() => destinationPayload({ ...draft, [key]: '   ' }));
  for (const [key, max] of [['nameVi', 150], ['nameEn', 150], ['slug', 180], ['shortDescriptionVi', 500], ['shortDescriptionEn', 500], ['imageUrl', 2048]]) {
    assert.doesNotThrow(() => destinationPayload({ ...draft, [key]: 'x'.repeat(max) }));
    assert.throws(() => destinationPayload({ ...draft, [key]: 'x'.repeat(max + 1) }));
  }
  assert.throws(() => destinationPayload({ ...draft, region: 'WEST' }));
  assert.throws(() => destinationPayload({ ...draft, status: 'REVIEW' }));
  assert.equal(destinationPayload({ ...draft, descriptionVi: 'x'.repeat(10000) }).descriptionVi.length, 10000);
});

test('Admin combines filters, preserves cancellation, and uses the current Bearer token', async () => {
  calls.length = 0;
  storage.set('token', 'rotated-destination-token');
  const signal = new AbortController().signal;
  await adminDestinationService.list({ keyword: 'Hanoi', status: 'DRAFT', region: 'NORTH', page: 5 }, { signal });
  assert.deepEqual(calls[0], { method: 'get', url: '/api/admin/destinations', params: { keyword: 'Hanoi', status: 'DRAFT', region: 'NORTH' }, body: undefined, signal, token: 'Bearer rotated-destination-token' });
  await destinationService.list({ keyword: '', region: null, status: 'DRAFT' });
  assert.equal(calls[1].url, '/api/destinations');
  assert.deepEqual(calls[1].params, {});
});

test('Create and all four status updates use POST/PUT and keep unpublished entries out of Learner', async () => {
  calls.length = 0;
  let entry = await adminDestinationService.create(destinationPayload(draft));
  assert.equal(entry.status, 'DRAFT');
  assert.equal((await adminDestinationService.get(entry.id)).nameVi, 'Hà Nội');
  for (const status of DESTINATION_STATUSES) {
    entry = await adminDestinationService.update(entry.id, destinationPayload({ ...destinationDraft(entry), status }));
    assert.equal(entry.status, status);
    const learnerList = await destinationService.list({ keyword: 'Hanoi', region: 'NORTH' });
    if (status === 'PUBLISHED') {
      assert.deepEqual(learnerList.map(item => item.id), [entry.id]);
      assert.equal((await destinationService.get(entry.id)).nameEn, 'Hanoi');
      assert.ok(entry.publishedAt);
    } else {
      assert.equal(learnerList.length, 0);
      await assert.rejects(destinationService.get(entry.id), error => error.status === 404);
    }
  }
  assert.ok(entry.archivedAt);
  const writes = calls.filter(call => call.body);
  assert.equal(writes[0].method, 'post');
  assert.ok(writes.slice(1).every(call => call.method === 'put'));
  assert.ok(writes.every(call => !Object.keys(call.body).some(key => ['id', 'createdAt', 'updatedAt', 'publishedAt', 'archivedAt'].includes(key))));
  assert.ok(calls.every(call => !call.url.includes('/status') && call.method !== 'delete'));
});

test('Duplicate slug remains a 409 error and does not create another entry', async () => {
  const count = entries.length;
  await assert.rejects(adminDestinationService.create(destinationPayload(draft)), error => error.status === 409 && error.message.includes('slug'));
  assert.equal(entries.length, count);
});

test('Legacy slugs resolve through the published list and numeric detail, without admin reads', async () => {
  const original = entries[0];
  await adminDestinationService.update(original.id, destinationPayload({ ...destinationDraft(original), status: 'PUBLISHED' }));
  calls.length = 0;
  assert.equal((await destinationService.getBySlug('ha-noi')).id, original.id);
  assert.deepEqual(calls.map(call => call.url), ['/api/destinations', '/api/destinations/1']);
  await assert.rejects(destinationService.getBySlug('missing-slug'), error => error.status === 404);
  await adminDestinationService.update(original.id, destinationPayload({ ...destinationDraft(original), status: 'ARCHIVED' }));
  await assert.rejects(destinationService.getBySlug('hanoi'), error => error.status === 404);
});

test('Failed API envelopes and server failures reject instead of reporting success', async () => {
  envelopeFailure = true;
  await assert.rejects(adminDestinationService.list(), /Save rejected/);
  envelopeFailure = false;
  failureStatus = 500;
  await assert.rejects(destinationService.list(), error => error.status === 500);
  failureStatus = null;
  assert.equal(redirects.length, 0);
});

test('401 and 403 keep the existing auth redirects and token clearing behavior', async () => {
  failureStatus = 403;
  await assert.rejects(adminDestinationService.list(), error => error.status === 403);
  assert.equal(redirects.at(-1), '/forbidden');
  failureStatus = 401;
  await assert.rejects(destinationService.list(), error => error.status === 401);
  assert.equal(redirects.at(-1), '/login?from=%2Fadmin%2Fdestinations');
  assert.equal(storage.has('token'), false);
  failureStatus = null;
});

test('An aborted request never reaches the backend adapter', async () => {
  const controller = new AbortController();
  controller.abort();
  const count = calls.length;
  await assert.rejects(destinationService.list({}, { signal: controller.signal }), /canceled/);
  assert.equal(calls.length, count);
});

test('Destination routes preserve legacy Explore and the existing Vocabulary flow', () => {
  const keys = ['ADMIN_DESTINATIONS', 'ADMIN_DESTINATION_DETAIL', 'CONTENT_DESTINATIONS', 'CONTENT_DESTINATION_DETAIL', 'EXPLORE', 'DESTINATION_DETAIL', 'EXPLORE_VIETNAM', 'LEARNER_DESTINATION_DETAIL', 'VOCABULARY', 'VOCABULARY_NOTEBOOK', 'VOCABULARY_REVIEW'];
  const routes = keys.map(id => ({ id, path: ROUTES[id] }));
  for (const [path, id] of [['/admin/destinations', 'ADMIN_DESTINATIONS'], ['/admin/destinations/1', 'ADMIN_DESTINATION_DETAIL'], ['/content/destinations', 'CONTENT_DESTINATIONS'], ['/content/destinations/1', 'CONTENT_DESTINATION_DETAIL'], ['/explore', 'EXPLORE'], ['/explore/1', 'DESTINATION_DETAIL'], ['/explore-vietnam', 'EXPLORE_VIETNAM'], ['/destinations/1', 'LEARNER_DESTINATION_DETAIL'], ['/vocabulary', 'VOCABULARY'], ['/vocabulary/notebook', 'VOCABULARY_NOTEBOOK'], ['/vocabulary/review', 'VOCABULARY_REVIEW']]) {
    assert.equal(matchRoutes(routes, path).at(-1).route.id, id);
  }
});
