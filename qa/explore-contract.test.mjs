import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import axios from 'axios';
import runtimeClient from '../src/shared/api/axiosClient.js';
import { exploreCultures, resolveExploreCultures, openableExploreScenarios } from '../src/features/explore/models/DestinationExplore.js';

const calls=[];
globalThis.localStorage={ getItem: key => key === 'token' ? 'explore-token' : null, removeItem() {} };
globalThis.window={location:{pathname:'/explore',search:'',assign() {}}};
globalThis.__exploreContract={axios};
const load=source => import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const {default:client}=await load((await fs.readFile(new URL('../src/shared/api/axiosClient.js',import.meta.url),'utf8'))
  .replace("import axios from 'axios';",'const {axios}=globalThis.__exploreContract;').replace('import.meta.env.VITE_API_BASE_URL','({}).VITE_API_BASE_URL'));
globalThis.__exploreContract.client=client;
const {destinationExploreService}=await load((await fs.readFile(new URL('../src/features/explore/api/destinationExploreService.js',import.meta.url),'utf8'))
  .replace(/import axiosClient from [^;]+;/,'const axiosClient=globalThis.__exploreContract.client;'));
let failed=false;
const adapter=async config => {
  calls.push(config);
  if (config.url === '/api/culture/articles') {
    return {config,status:200,statusText:'OK',headers:{},data:{code:1000,result:[{
      id:'culture-from-api',title:'Culture from API',summary:'API content',status:'PUBLISHED'
    }]}};
  }
  return {config,status:200,statusText:'OK',headers:{},data:failed?{code:9999,message:'Rejected',success:false}:{code:1000,result:{vocabulary:[],regionalVariants:[],cultureIds:[],scenarios:[]}}};
};
client.defaults.adapter=adapter;
runtimeClient.defaults.adapter=adapter;
test('Explore content uses a read-only endpoint with JWT and cancellation; no start call',async () => {
  const signal=new AbortController().signal;
  const result=await destinationExploreService.get(42,{signal});
  assert.deepEqual(result.cultureIds,[]);
  assert.equal(calls.at(-1).method,'get'); assert.equal(calls.at(-1).url,'/api/destinations/42/content');
  assert.equal(calls.at(-1).headers.Authorization,'Bearer explore-token'); assert.equal(calls.at(-1).signal,signal);
  assert.equal(calls.at(-1).data,undefined);
});
test('Saving Explore links sends source IDs without lesson, progress, reward or user fields',async () => {
  await destinationExploreService.save(42,{vocabularyIds:[3],cultureIds:['hue-culture'],scenarioIds:['goi-mon-pho-ha-noi'],lessonIds:[9],progressPercent:100,userId:999});
  assert.equal(calls.at(-1).url,'/api/admin/destinations/42/explore-content');
  assert.deepEqual(JSON.parse(calls.at(-1).data),{vocabularyIds:[3],cultureIds:['hue-culture'],scenarioIds:['goi-mon-pho-ha-noi']});
  await destinationExploreService.management(42); assert.equal(calls.at(-1).method,'get');
  await destinationExploreService.scenarios(); assert.equal(calls.at(-1).url,'/api/ai/scenarios');
});
test('Rejected content and saves remain errors',async () => {
  failed=true;
  await assert.rejects(destinationExploreService.get(42),/Rejected/);
  await assert.rejects(destinationExploreService.save(42,{vocabularyIds:[],cultureIds:[],scenarioIds:[]}),/Rejected/);
  failed=false;
});
test('Culture references resolve from the Culture API and never substitute another article',async () => {
  const articles=await exploreCultures(); assert(articles.length>0);
  assert.deepEqual(await resolveExploreCultures(['missing',articles[0].id]),[articles[0]]);
});
test('Scenario links trust ACTIVE records returned by the Backend',() => {
  const first={id:'dynamic-scenario',title:'Dynamic',status:'ACTIVE'};
  const second={id:'another-dynamic-scenario',title:'Another',status:'ACTIVE'};
  const rows=[first,second,{id:'draft-scenario',status:'DRAFT'}];
  assert.deepEqual(openableExploreScenarios(rows),[first,second]);
});
