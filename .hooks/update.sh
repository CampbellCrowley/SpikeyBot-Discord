#!/bin/bash
if grep -q " git@github.com:" .git/config; then
  echo "Attempting update from GIT via SSH"
  ssh-agent bash -c "ssh-add ~/.ssh/sb_id_rsa_nopass && git fetch --all && git reset --hard origin/master && git submodule update && npm i --production && npm i youtube-dl"; kill $SSH_AGENT_PID
else
  echo "Attempting update from GIT via HTTP"
  git fetch --all && git reset --hard origin/master && git submodule update && npm i --production && npm i youtube-dl
fi
