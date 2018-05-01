#!/bin/bash
GITROOT="$(git rev-parse --show-toplevel)"
echo "Creating md files from json"
npm run docs:help
if [[ "$?" != 0 ]]; then
  exit $?
fi

CMDDIR="$GITROOT/docs/commands/"
mkdir -p "$CMDDIR"
mv docs/*.json.md "$CMDDIR"

echo "Creating md files from jsdoc"
JSDOC="$GITROOT/docs/README.md"

echo "[Commands Help](commands/)" > "$JSDOC"

"$GITROOT/node_modules/.bin/jsdoc2md" src/*.js --private >> "$JSDOC"
