import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { exec } from '../lib/exec.js';
import simpleGit from 'simple-git';

const git = simpleGit();

export async function performSquash(forcePushFlag, baseBranch) {
  const branch = (await git.revparse(['--abbrev-ref', 'HEAD'])).trim();
  console.log(`\n🔨 Squashing commits on branch: ${branch} (base: ${baseBranch})`);

  await exec(`git reset --soft ${baseBranch}`);

  const status = execSync('git status --porcelain').toString().trim();
  if (!status) {
    console.log('⚠️ Nothing to commit after squash. Working tree is clean.');
    return;
  }

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
