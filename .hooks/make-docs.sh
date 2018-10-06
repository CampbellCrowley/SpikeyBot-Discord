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

echo "# Commands Help" > "$CMDDIR/README.md"
for FILE in $CMDDIR*.md; do
  if [[ "$FILE" != "$CMDDIR"README.md ]]; then
    cat "$FILE" >> "$CMDDIR"README.md
  fi
done

echo "Creating md files from jsdoc"
JSDOC="$GITROOT/docs/README.md"

echo "[Commands Help](commands/)" > "$JSDOC"

"$GITROOT/node_modules/.bin/jsdoc2md" src/*.js src/**/*.js --private >> "$JSDOC"
if [[ "$?" != 0 ]]; then
  exit 1
fi

rm -rf /tmp/jsdoc-api/
rm -rf /tmp/dmd/
