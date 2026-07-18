'use strict';

const { spawn } = require('node:child_process');
const readline = require('node:readline');
const { getBinaryPath } = require('@sysutils/ps-dotnet');

const DEFAULT_FIELDS = ['pid', 'ppid', 'name', 'command', 'memory', 'cpu'];

function createProcessStream(options = {}) {
  const { backend = 'dotnet', fields = DEFAULT_FIELDS } = options;

  if (backend !== 'dotnet') {
    throw new Error(`Unsupported backend: ${backend}`);
  }

  const bin = getBinaryPath();
  const args = [];
  if (fields && fields.length) {
    args.push('--fields', fields.join(','));
  }

  const child = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });

  const rl = readline.createInterface({ input: child.stdout });

  const stream = rl;
  stream.process = child;

  child.on('error', (err) => {
    stream.emit('error', err);
  });

  child.stderr.on('data', (chunk) => {
    stream.emit('stderr', chunk);
  });

  child.on('close', (code) => {
    stream.emit('close', code);
  });

  return stream;
}

module.exports = { createProcessStream };