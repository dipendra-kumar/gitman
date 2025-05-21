#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { validateGitRepo } from '../lib/git-utils.js';
import { loadConfig, resetConfig, setupConfig } from '../lib/config.js';
import { performSquash } from '../commands/squash.js';
import { createPR } from '../commands/pr.js';

const argv = yargs(hideBin(process.argv))
  .usage('💼 Git Toolbelt\n\nUsage:\n  $0 [options]')
  .option('squash', {
    type: 'boolean',
    description: 'Squash all commits on current branch',
  })
  .option('force-push', {
    type: 'boolean',
    description: 'Force push after squash without prompt',
  })
  .option('create-pr', {
    type: 'string',
    description: 'Create a PR to the given target branch',
  })
  .option('reset', {
    type: 'boolean',
    description: 'Reset all stored configuration',
  })
  .help()
  .alias('h', 'help').argv;

(async () => {
  if (argv.reset) {
    resetConfig();
    process.exit(0);
  }

  validateGitRepo();

  let config = loadConfig();
  if (!config.baseBranch || !config.gitProvider) {
    config = await setupConfig();
  }

  if (argv.squash) {
    await performSquash(argv['force-push'], config.baseBranch);
  } else if (argv['create-pr']) {
    await createPR(argv['create-pr'], config.gitProvider);
  } else {
    console.log('🤔 No valid operation specified. Use --help for usage.');
  }
})();
