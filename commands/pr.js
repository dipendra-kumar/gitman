import simpleGit from 'simple-git';
import { exec } from '../lib/exec.js';

const git = simpleGit();

export async function createPR(targetBranch, gitProvider) {
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
  } catch {
    console.error('❌ Failed to open browser. Here is the PR link:\n' + prUrl);
  }
}
