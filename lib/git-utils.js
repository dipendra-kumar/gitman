import { execSync } from 'child_process';

export function validateGitRepo() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  } catch {
    console.error('❌ Not inside a Git repository.');
    process.exit(1);
  }
}
