# LIST=$(find ./ -name *.DELETEME | sed 's/.DELETEME$//' | tr '\n' ' ')
LIST=$(find /home/admin/SpikeyBot-Discord/save/ -size 0 -not -name enableBotCommands | tr '\n' ' ')
echo "$LIST"
for i in $LIST; do
  if [ -f "$i" ]; then
    rm "$i"
  fi
done

# nice rsync -urptW --rsync-path="nice rsync" --exclude-from="sync-exclude.txt" /home/admin/SpikeyBot-Discord/save/ admin@kamino1:/home/admin/SpikeyBot-Discord/save/ &&\
# nice rsync -urptW --rsync-path="nice rsync" --exclude-from="sync-exclude.txt" admin@kamino1:/home/admin/SpikeyBot-Discord/save/ /home/admin/SpikeyBot-Discord/save/

# for i in $LIST; do
#   if [ -f "$i.DELETEME" ]; then
#     rm "$i" "$i.DELETEME"
#   fi
# done
