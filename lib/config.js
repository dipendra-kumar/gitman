import fs from 'fs';
import os from 'os';
import path from 'path';
import inquirer from 'inquirer';

const CONFIG_FILE = path.join(os.homedir(), '.git-toolbelt-config.json');

export function loadConfig() {
  return fs.existsSync(CONFIG_FILE)
    ? JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
    : {};
}

export function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

export function resetConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE);
    console.log('🔄 Configuration reset.');
  } else {
    console.log('⚠️ No configuration found to reset.');
  }
}

export async function setupConfig() {
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
