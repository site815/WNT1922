import test from 'node:test';
import assert from 'node:assert/strict';
import { referenceDestination, openReference } from '../worker/desktop/link-policy.mjs';

test('desktop reference routing rejects malformed, privileged and credential-bearing links without throwing',()=>{
  const origin='http://127.0.0.1:12345';
  for(const url of ['', 'not a URL', 'javascript:alert(1)', 'file:///C:/Windows/system.ini',
    'powershell:command', 'https://name:password@example.com',origin+'/ui/app.mjs'])
    assert.equal(referenceDestination(url,origin),'deny',url);
  assert.equal(referenceDestination(origin+'/assets/licenses/third-party-notices.html',origin),'credits');
  assert.equal(referenceDestination('https://commons.wikimedia.org/wiki/File:Ship.svg',origin),'external');
});

test('missing or Windows-blocked external browser produces a handled error instead of a rejected main-process promise',async()=>{
  const reports=[];
  assert.equal(await openReference('https://example.org/',{
    open:async()=>{throw Error('Windows denied opening the browser.');},
    report:async message=>reports.push(message),
  }),false);
  assert.deepEqual(reports,['Windows denied opening the browser.']);
  assert.equal(await openReference('https://example.org/',{
    open:async()=>{throw Error('Browser unavailable.');},report:async()=>{throw Error('Window already closed.');},
  }),false);
  const opened=[];
  assert.equal(await openReference('https://example.org/',{open:async value=>opened.push(value),report:async()=>assert.fail()}),true);
  assert.deepEqual(opened,['https://example.org/']);
});
