#!/bin/bash
GITROOT="$(git rev-parse --show-toplevel)"

echo "Creating html files from jsdoc"
"$GITROOT/node_modules/.bin/jsdoc" -c "$GITROOT/.hooks/jsdoc.conf.js"
