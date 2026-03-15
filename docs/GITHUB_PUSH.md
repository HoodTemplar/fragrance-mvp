# Push this project to GitHub — step by step

This guide assumes you have never pushed a project to GitHub before. Do each step in order.

---

## Step 1: Make sure Git is installed

1. Open **Terminal** (on Mac: press `Cmd + Space`, type **Terminal**, press Enter).
2. Type this and press Enter:
   ```bash
   git --version
   ```
3. If you see something like `git version 2.x.x`, Git is installed. Go to **Step 2**.
4. If you see "command not found", install Git first:
   - **Mac:** Install Xcode Command Line Tools: run `xcode-select --install` in Terminal, or install Git from [git-scm.com](https://git-scm.com/download/mac).
   - **Windows:** Download and run the installer from [git-scm.com](https://git-scm.com/download/win).

---

## Step 2: (Optional) Set your Git name and email

Git records who made each commit. If you haven’t set this before, do it once:

1. In Terminal, run (replace with your name and email):
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```
2. Use the **same email** as your GitHub account so your commits link to your profile.

---

## Step 3: Create a GitHub account (if you don’t have one)

1. Go to [github.com](https://github.com).
2. Click **Sign up**.
3. Enter email, password, and username. Complete the sign-up and verify your email if asked.

---

## Step 4: Create a new repository on GitHub

1. Log in to GitHub.
2. In the top-right, click the **+** icon, then **New repository**.
3. Fill in:
   - **Repository name:** e.g. `scent-dna` or `Fragrance-MVP` (no spaces).
   - **Description:** optional, e.g. "Scent DNA fragrance app MVP".
   - **Public** is fine for most projects.
   - **Do not** check "Add a README", "Add .gitignore", or "Choose a license" — the project already has these.
4. Click **Create repository**.
5. GitHub will show a page with setup commands. **Leave this page open** — you’ll use the repo URL in the next steps.

---

## Step 5: Open your project folder in Terminal

1. Open Terminal.
2. Go to your project folder. Type (adjust the path if your project is somewhere else):
   ```bash
   cd /Users/t/Desktop/Fragrance\ MVP
   ```
   Or: type `cd `, then drag the **Fragrance MVP** folder from Finder into the Terminal window, then press Enter.
3. Check you’re in the right place:
   ```bash
   pwd
   ```
   You should see a path that ends in `Fragrance MVP`.

---

## Step 6: Check that Git is already set up (done for you)

This project is already a Git repo with one commit. Confirm with:

```bash
git status
```

You should see: **On branch main** and something like **nothing to commit, working tree clean**. If so, go to **Step 7**.

---

## Step 7: Add GitHub as the “remote”

Your computer has the code; GitHub is the “remote” where you’ll push it.

1. On the GitHub page for your new repo, copy the **repository URL**. It looks like:
   - **HTTPS:** `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git`
   - **SSH:** `git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git`
   Use HTTPS if you’re not sure.

2. In Terminal (in your project folder), run (paste **your** URL in place of the example):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```
   Example: if your username is `jane` and the repo is `scent-dna`:
   ```bash
   git remote add origin https://github.com/jane/scent-dna.git
   ```

3. Check it was added:
   ```bash
   git remote -v
   ```
   You should see `origin` and your URL twice (fetch and push).

---

## Step 8: Push your code to GitHub

1. In Terminal, run:
   ```bash
   git push -u origin main
   ```

2. If GitHub asks you to sign in:
   - **HTTPS:** It may open a browser or ask for username and password. Use your GitHub **username** and a **Personal Access Token** (not your GitHub password). To create a token: GitHub → Settings → Developer settings → Personal access tokens → Generate new token. Give it “repo” scope, copy it, and paste it when Git asks for a password.
   - **SSH:** You need an SSH key added to your GitHub account first; see [GitHub’s SSH guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh).

3. When the command finishes, you should see something like:
   ```text
   Enumerating objects: ...
   Writing objects: 100% ...
   To https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    * [new branch]      main -> main
   ```

4. Refresh your repo page on GitHub. You should see all your project files and folders.

---

## Step 9: Confirm what’s on GitHub

- **Never** commit `.env.local` — it’s in `.gitignore` and should stay on your computer only (it has your secret keys).
- **Do** commit `.env.example` — it’s the template without real secrets.
- If you don’t see `.env` or `.env.local` on GitHub, that’s correct.

---

## If something goes wrong

| Problem | What to do |
|--------|------------|
| `git: command not found` | Install Git (Step 1). |
| `remote origin already exists` | You already added the remote. Use `git remote set-url origin YOUR_URL` to change it, or skip to Step 8. |
| `Authentication failed` or `Permission denied` | Use a Personal Access Token instead of your password (Step 8), or set up SSH. |
| `branch 'main' doesn't exist` | Run `git branch -M main` then try `git push -u origin main` again. |
| `failed to push some refs` | Someone else may have pushed first. Run `git pull origin main --rebase`, then `git push -u origin main`. |

---

## After the first push: making more pushes later

When you change the project and want to save those changes to GitHub:

1. In Terminal, go to your project folder:
   ```bash
   cd /Users/t/Desktop/Fragrance\ MVP
   ```
2. Stage your changes:
   ```bash
   git add -A
   ```
3. Commit with a short message:
   ```bash
   git commit -m "Describe what you changed"
   ```
4. Push to GitHub:
   ```bash
   git push
   ```

You only need to do Step 7 once. After that, `git push` is enough.
