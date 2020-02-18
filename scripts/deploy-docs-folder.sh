#!/bin/sh

REPO_PATH="https://${ACCESS_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"

git worktree add -f docs origin/gh-pages && \
    yarn docs && \
    cd docs && \
    git add -f . && \
    git config user.email "actions@github.com" && \
    git config user.name "Github Actions" && \
    git commit -m "Deploying docs ${GITHUB_SHA}" --quiet --no-verify && \
    echo "pushing"
    # git push "$REPO_PATH" HEAD:gh-pages

git worktree remove docs