/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: 'command',
  commandRunner: { command: 'npm test' },
  // cli.mjs is excluded: it only resolves the repo paths and logs, so no behavioural test constrains it.
  mutate: ['docx.mjs', 'site.mjs', 'build.mjs'],
  reporters: ['clear-text', 'progress'],
  thresholds: { high: 95, low: 90, break: 90 },
  timeoutMS: 10000,
  dryRunTimeoutMinutes: 2,
  concurrency: 4,
  tempDirName: '.stryker-tmp',
};
