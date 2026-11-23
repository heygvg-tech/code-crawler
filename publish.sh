#!/usr/bin/env bash
# The Magic Spell: puts Code Crawler on your GitHub and turns on the live website.
# Usage:  bash publish.sh            (repo will be called code-crawler)
#         bash publish.sh my-name    (pick your own repo name)
set -e
REPO="${1:-code-crawler}"

say() { printf "\n\033[1;33m🗝️  %s\033[0m\n" "$1"; }

command -v git >/dev/null || { say "You need git. On a Mac, run: xcode-select --install   then try again."; exit 1; }
command -v gh  >/dev/null || { say "You need the GitHub CLI. Install it from https://cli.github.com (Mac: brew install gh), then try again."; exit 1; }

if ! gh auth status >/dev/null 2>&1; then
  say "Logging you into GitHub. Pick: GitHub.com → HTTPS → Login with a web browser."
  gh auth login
fi

OWNER="$(gh api user -q .login)"
say "Hi $OWNER. Summoning your repo: $REPO"

# Put your real live-site link in the README.
sed -i.bak "s/YOUR-GITHUB-USERNAME/$OWNER/g; s/heygvg-tech/$OWNER/g; s#github.io/code-crawler#github.io/$REPO#g" README.md && rm -f README.md.bak

[ -d .git ] || git init -b main >/dev/null
git config user.name  >/dev/null || git config user.name  "$(gh api user -q '.name // .login')"
git config user.email >/dev/null || git config user.email "$(gh api user -q '.id')+$OWNER@users.noreply.github.com"
git add -A
git commit -m "Enter the dungeon: Code Crawler" >/dev/null 2>&1 || true
git branch -M main

if git remote get-url origin >/dev/null 2>&1; then
  git push -u origin main
else
  gh repo create "$REPO" --public --source=. --remote=origin --push \
    --description "A dungeon-crawler game that teaches you to code, with an AI that reviews your code (and roasts you a little)."
fi

say "Turning on GitHub Pages..."
gh api -X POST "repos/$OWNER/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 \
  || gh api -X PUT "repos/$OWNER/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 \
  || say "Couldn't flip the Pages switch for you. Do it by hand: repo Settings → Pages → Source: GitHub Actions."

sleep 3
gh workflow run deploy.yml -R "$OWNER/$REPO" >/dev/null 2>&1 || true

say "DONE. Your dungeon is building. In about 2 minutes it'll be live at:"
echo "   https://$OWNER.github.io/$REPO/"
echo "   Your code lives at: https://github.com/$OWNER/$REPO"
