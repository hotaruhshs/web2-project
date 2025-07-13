````markdown
# 🧠 Git Guide for My Web2 Project

A simple, beginner-friendly cheat sheet for managing my GitHub repo using Git and VS Code.

---

## ✅ AFTER CREATING THE GITHUB REPOSITORY

### 🔗 1. Link Local Folder to Remote Repository

In the terminal inside VS Code:

```bash
git init
git remote add origin https://github.com/hotaruhshs/web2-project.git
````

---

## 💾 2. Stage and Commit Files

Add and commit all files:

```bash
git add .
git commit -m "Initial commit"
```

---

## 📤 3. Push to GitHub

Check your current branch:

```bash
git branch
```

If it says `master`, use:

```bash
git push -u origin master
```

If it says `main`, use:

```bash
git push -u origin main
```

✅ This uploads your project to GitHub.

---

## 🔁 4. Pull Latest Changes (from GitHub)

To get updates from the remote repository:

```bash
git pull
```

---

## 🔄 5. Daily Update Workflow

Whenever you make changes:

```bash
git add .
git commit -m "Describe what you changed"
git push
```

> Example: `"Add login form validation"` or `"Fix responsive layout"`

---

## 🧪 6. Helpful Git Commands

| Command                   | Description                          |
| ------------------------- | ------------------------------------ |
| `git status`              | Shows what files changed             |
| `git log`                 | Shows commit history                 |
| `git reset --soft HEAD~1` | Undo last commit (keep your changes) |
| `git pull`                | Sync local with remote               |
| `git push`                | Upload commits to GitHub             |
| `git branch`              | Check or switch branches             |

---

## 💻 VS Code Tips

* 🗂 Click the **Source Control** icon (`Ctrl+Shift+G`)
* ✍️ Type your commit message above and click the **✓ checkmark**
* 📤 Use the **three-dot menu (⋮)** for `Push`, `Pull`, and `Sync`

---

## 🔧 Recommended VS Code Extensions

| Extension    | What It Does                                |
| ------------ | ------------------------------------------- |
| GitLens      | Shows who changed what, when, and why       |
| Git Graph    | Visual graph of commits & branches          |
| Sticky Notes | Pin this guide inside VS Code for quick use |

---

## 🧠 Pro Tips

* Always pull before pushing (`git pull`) to prevent conflicts.
* Make meaningful commit messages.
* Create branches for features or experiments:

  ```bash
  git checkout -b new-feature
  ```

---

📁 Repo: [hotaruhshs/web2-project](https://github.com/hotaruhshs/web2-project)

```