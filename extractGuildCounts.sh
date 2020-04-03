#!/bin/bash
# This is an example of how to extract the timestamp and guild counts from the
# bot's log. This is kept here as reference until a more general solution is
# implented. This is basically just a regex substitute using sed, to format into
# CSV format for use in spreadsheets.

cat output.log | grep "Current Guild Count" | sed -E 's/^.*([0-9]{2}-[0-9]{2}) ([0-9]{2}:[0-9]{2}:[0-9]{2}).*Current Guild Count: ([0-9]+).*$/\1,\2,\1 \2,\3/g'
# tar -xaOf output.log.tar.gz
