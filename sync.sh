#!/bin/bash
DIR=$(dirname "$0")
SAVEDIR="$DIR/save"

# Avatar cleanup
MULTIPLES=$(find "$SAVEDIR/users/avatars/" -type f -iname '*' -printf '%h\n' | sort | uniq -c | awk '$1 > 1' | awk '{print $2}')
for d in $MULTIPLES; do
  find "$d" -type f -printf '%T+ %p\n' | sort -t $'\t' -g | head -n -1 | cut -d $'\t' -f 2- | awk '{print $2}'| xargs rm --
done

# NPC Avatar Cleanup
# NPCS=$(find "$SAVEDIR/users/avatars/" -type d -name "NPC*" -mtime +7 -printf '%f\n')
# for n in $NPCS; do
#   if grep -rq "$n" "$SAVEDIR/guilds/"; then
#     echo -n
#   else
#     echo "$SAVEDIR/users/avatars/$n" | xargs rm -rf --
#   fi
# done

# Empty File Cleanup
LIST=$(find "$SAVEDIR" -size 0 -not -name enableBotCommands | tr '\n' ' ')
echo "$LIST"
for i in $LIST; do
  if [ -f "$i" ]; then
    rm "$i"
  fi
done
