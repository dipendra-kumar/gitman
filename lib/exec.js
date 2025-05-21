import { execSync } from 'child_process';

export function exec(cmd, options = {}) {
  return execSync(cmd, { stdio: 'inherit', ...options });
}
