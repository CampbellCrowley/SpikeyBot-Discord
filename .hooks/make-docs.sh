#!/bin/bash
GITROOT="$(git rev-parse --show-toplevel)"
echo "Creating md files from jsdoc"
"$GITROOT/node_modules/.bin/jsdoc2md" src/*.js --private > docs/README.md
echo "Creating md files from json"
npm run docs:help
