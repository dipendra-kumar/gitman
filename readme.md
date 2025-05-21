# 🚀 gitman

**gitman** is a modern and minimal CLI tool to streamline your Git workflow. Easily squash commits, push branches, and generate pull request URLs for GitHub—all from your terminal.

---

## 📦 Features

- 🔨 Squash all commits on the current branch against a base branch
- 🚀 Force-push changes with or without confirmation
- 🔗 Generate GitHub Pull Request links (opens in browser)
- ⚙️ Remembers your preferences in `~/.gitman-config.json`

---

## 🛠 Installation

```bash
git clone https://github.com/dipendra-kumar/gitman.git
cd gitman
npm install
chmod +x /bin/cli.js
```

You can run it directly:

```bash
node /bin/cli,js --help
```

Or link it globally (optional):

```bash
npm link
gitman --help
```

---

## 🧰 Usage

### Initial Setup

On first use, `gitman` will prompt for:
- A default base branch (e.g. `main`, `develop`)
- Your Git provider (currently only GitHub supported)

Settings are saved to `~/.gitman-config.json`.

---

### 🔨 Squash Commits

```bash
gitman --squash
```

Squashes all commits on the current branch since the base branch. You’ll be prompted for a new commit message.

Optional:

```bash
--force-push   # Automatically force-push after squashing
```

---

### 🔗 Create Pull Request Link

```bash
gitman --create-pr main
```

Generates a GitHub Pull Request link from the current branch to `main` and attempts to open it in your browser.

> 💡 This does **not** create the PR directly—just opens the compare view with prefilled branches.

---

### 🔁 Reset Configuration

```bash
gitman --reset
```

Clears your saved settings and starts fresh.

---

## 📄 Example Workflow

```bash
git checkout -b feature/add-cta
# make commits...
gitman --squash --force-push
gitman --create-pr main
```

---

## 📌 Roadmap

- [x] PR link generation for GitHub 
- [ ] Direct PR creation using GitHub API
- [ ] Support for GitLab and Bitbucket
- [ ] Merge PR from CLI

---

## 🧑‍💻 Contributing

Open to ideas, suggestions, and PRs! Feel free to fork and submit improvements.

---

## 🪪 License

MIT © Dipendra Kumar Bhatt
