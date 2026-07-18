import { Readable } from 'node:stream';

export interface ProcessInfo {
  pid: number;
  ppid?: number | null;
  name?: string | null;
  command?: string | null;
  memory?: number | null;
  cpu?: number | null;
  [key: string]: unknown;
}

export interface CreateProcessStreamOptions {
  backend?: 'dotnet';
  fields?: string[];
}

export function createProcessStream(
  options?: CreateProcessStreamOptions,
): Readable & { process: import('node:child_process').ChildProcess };