/* @flow */

import {existsSync} from 'fs';

import NoopReporter from '../src/reporters/base-reporter.js';
import makeTemp from './_temp';
import * as fs from '../src/util/fs.js';

const path = require('path');
const exec = require('child_process').exec;

const fixturesLoc = path.join(__dirname, './fixtures/error-log-file');
const yarnBin = path.join(__dirname, '../bin/yarn.js');

if (!existsSync(path.resolve(__dirname, '../lib'))) {
  throw new Error('These tests require `yarn build` to have been run first.');
}

async function execCommand(
  cmd: string,
  args: Array<string>,
  name: string,
): Promise<{workingDir: string, stdoutLines: Array<?string>}> {
  const srcDir = path.join(fixturesLoc, name);
  const workingDir = await makeTemp(name);
  await fs.copy(srcDir, workingDir, new NoopReporter());

  const cacheDir = path.join(workingDir, '.yarn-cache');

  return new Promise((resolve, reject) => {
    const cleanedEnv = {...process.env};
    cleanedEnv['YARN_SILENT'] = 0;
    cleanedEnv['YARN_WRAP_OUTPUT'] = 1;
    delete cleanedEnv['FORCE_COLOR'];

    exec(
      `node "${yarnBin}" --cache-folder="${cacheDir}" ${cmd} ${args.join(' ')}`,
      {
        cwd: workingDir,
        env: cleanedEnv,
      },
      (error, stdout, stderr) => {
        if (!error) {
          reject('Expected test to fail, yet no error detected');
        }

        resolve({
          workingDir,
          stdout,
        });
      },
    );
  });
}

function expectLogFile(result, expectedErrorFile: string) {
  expect(existsSync(path.resolve(result.workingDir, expectedErrorFile))).toBeTruthy();
  expect(result.stdout.replace(/\\\\/g, '\\')).toContain(expectedErrorFile);
}

test('error-log-file-no-config-no-arg', async () => {
  const result = await execCommand('add', ['nonExistingPackageForTesting'], 'no-config', true);
  expectLogFile(result, 'yarn-error.log');
});

test('error-log-file-no-config-relative-arg', async () => {
  const result = await execCommand(
    'add',
    ['nonExistingPackageForTesting', '--error-log-file', 'relativeFromArg.err'],
    'no-config',
    true,
  );
  expectLogFile(result, 'relativeFromArg.err');
});

test('error-log-file-no-config-absolute-arg', async () => {
  const errorLogDir = await makeTemp('no-config');
  const errorFile = path.join(errorLogDir, 'absoluteFromArg.err');
  const result = await execCommand(
    'add',
    ['nonExistingPackageForTesting', '--error-log-file', `"${errorFile}"`],
    'no-config',
    true,
  );
  expectLogFile(result, errorFile);
});

test('error-log-file-with-config-no-arg', async () => {
  const result = await execCommand('add', ['nonExistingPackageForTesting'], 'with-config', true);
  expectLogFile(result, 'fromConfig.txt');
});

test('error-log-file-with-config-relative-arg', async () => {
  const result = await execCommand(
    'add',
    ['nonExistingPackageForTesting', '--error-log-file', 'relativeFromArg.err'],
    'with-config',
    true,
  );
  expectLogFile(result, 'relativeFromArg.err');
});

test('error-log-file-with-config-absolute-arg', async () => {
  const errorLogDir = await makeTemp('no-config');
  const errorFile = path.join(errorLogDir, 'absoluteFromArg.err');
  const result = await execCommand(
    'add',
    ['nonExistingPackageForTesting', '--error-log-file', `"${errorFile}"`],
    'with-config',
    true,
  );
  expectLogFile(result, errorFile);
});
