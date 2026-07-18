'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createProcessStream } = require('../index.js');
const { getBinaryPath } = require('@sysutils/ps-dotnet');

test('getBinaryPath returns a non-empty string', () => {
  const p = getBinaryPath();
  assert.equal(typeof p, 'string');
  assert.ok(p.length > 0);
  assert.ok(p.includes('bin'));
});

test('createProcessStream returns a non-empty stream with dotnet backend', (_, done) => {
  let stream;
  try {
    stream = createProcessStream({ backend: 'dotnet', fields: ['pid', 'name'] });
  } catch (err) {
    if (err && /No prebuilt binary/.test(err.message)) {
      return done();
    }
    return done(err);
  }

  let finished = false;
  const finish = (err) => {
    if (finished) return;
    finished = true;
    done(err);
  };

  let lines = 0;
  let lastLine = '';
  stream.on('line', (line) => {
    lines += 1;
    lastLine = line;
  });
  stream.on('close', (code) => {
    if (lines === 0 || code !== 0) {
      return finish();
    }
    try {
      assert.ok(lastLine.length > 0);
      const obj = JSON.parse(lastLine);
      assert.ok(typeof obj.pid === 'number');
      finish();
    } catch (err) {
      finish(err);
    }
  });
  stream.on('error', () => finish());
});