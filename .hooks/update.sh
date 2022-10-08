#!/bin/bash
if grep -q " git@github.com:" .git/config; then
  echo "Attempting update from GIT via SSH"
  # ssh-agent bash -c "ssh-add ~/.ssh/sb_id_rsa_nopass && git fetch --all && git reset --hard origin/main && git submodule update && yarn i --production && yarn add youtube-dl"; kill $SSH_AGENT_PID
  ssh-agent bash -c "ssh-add ~/.ssh/sb_id_rsa_nopass && git fetch --all && git reset --hard origin/main && git submodule update && yarn install --production"; kill $SSH_AGENT_PID
else
  echo "Attempting update from GIT via HTTP"
  # git fetch --all && git reset --hard origin/main && git submodule update && npm i --production && npm i youtube-dl
  # git fetch --all && git reset --hard origin/main && git submodule update && npm i --production && npm remove youtube-dl
  git fetch --all && git reset --hard origin/main && git submodule update && npm i --production
fi
