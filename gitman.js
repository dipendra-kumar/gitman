#!/usr/bin/env node

const { execSync } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs');
const path = require('path');
const os = require('os');
const inquirer = require('inquirer');
const simpleGit = require('simple-git');

const git = simpleGit();

const CONFIG_FILE = path.join(os.homedir(), '.git-toolbelt-config.json');

// Load config
function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  }
  return {};
}

// Save config
function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

// Initial setup
async function setupConfig() {
  console.log('🛠️ Git Toolbelt initial setup:');
  const answers = await inquirer.prompt([
    {
      name: 'baseBranch',
      message: '🔧 Default base branch (e.g. main, master, develop):',
      default: 'main',
    },
    {
      name: 'gitProvider',
      type: 'list',
      message: '🌐 Which Git provider do you use?',
      choices: ['github', 'gitlab', 'bitbucket'],
    },
  ]);
  saveConfig(answers);
  return answers;
}

// Reset config
function resetConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE);
    console.log('🔄 Configuration reset.');
  } else {
    console.log('⚠️ No configuration found to reset.');
  }
}

// Exec helper
function exec(cmd) {
  return execSync(cmd, { stdio: 'inherit' });
}

// Validate Git repo
function validateGitRepo() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  } catch {
    console.error('❌ Not inside a Git repository.');
    process.exit(1);
  }
}

// Squash commits
async function performSquash(forcePushFlag, baseBranch) {
  const branch = (await git.revparse(['--abbrev-ref', 'HEAD'])).trim();
  console.log(`\n🔨 Squashing commits on branch: ${branch} (base: ${baseBranch})`);

  await exec(`git reset --soft ${baseBranch}`);
  const { commitMessage } = await inquirer.prompt([
    {
      name: 'commitMessage',
      message: '📝 Enter new commit message:',
      validate: msg => !!msg || 'Message cannot be empty',
    },
  ]);
  await exec(`git commit -m "${commitMessage}"`);

  if (forcePushFlag) {
    await exec(`git push --force`);
    console.log(`🚀 Changes force-pushed to ${branch}`);
  } else {
    const { confirmPush } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmPush',
        message: '❓ Do you want to force-push the changes to remote?',
        default: false,
      },
    ]);
    if (confirmPush) {
      await exec(`git push --force`);
      console.log(`🚀 Changes force-pushed to ${branch}`);
    } else {
      console.log('🛑 Skipped pushing changes. Don’t forget to push manually.');
    }
  }
}

// Create PR
async function createPR(targetBranch, gitProvider) {
  const branch = (await git.revparse(['--abbrev-ref', 'HEAD'])).trim();
  const remoteUrl = (await git.remote(['get-url', 'origin'])).trim();

  const repoMatch = remoteUrl.match(/[:/]([^/]+\/[^/.]+)(\.git)?$/);
  const repo = repoMatch ? repoMatch[1] : null;

  if (!repo) {
    console.error('❌ Unable to parse repository name from remote URL.');
    return;
  }

  let prUrl;
  switch (gitProvider) {
    case 'github':
      prUrl = `https://github.com/${repo}/compare/${targetBranch}...${branch}?expand=1`;
      break;
    case 'gitlab':
      prUrl = `https://gitlab.com/${repo}/-/merge_requests/new?merge_request[source_branch]=${branch}&merge_request[target_branch]=${targetBranch}`;
      break;
    case 'bitbucket':
      prUrl = `https://bitbucket.org/${repo}/pull-requests/new?source=${branch}&dest=${targetBranch}`;
      break;
  }

  console.log(`🔗 Open PR in browser: ${prUrl}`);
  try {
    exec(`open "${prUrl}" || xdg-open "${prUrl}" || start "" "${prUrl}"`);
  } catch (err) {
    console.error('❌ Failed to open browser. Here is the PR link:\n' + prUrl);
  }
}

// CLI entry
(async () => {
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
    .alias('h', 'help')
    .argv;

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
  }

  if (argv['create-pr']) {
    await createPR(argv['create-pr'], config.gitProvider);
  }

    if (!argv.squash && !argv['create-pr']) { // if any arguments were provided in future, this should be updated.
    if (!config.baseBranch || !config.gitProvider) {
      config = await setupConfig(); 
    } else {
      console.log('🤔 No valid operation specified. Use --help for usage.');
    }
  }

})();
