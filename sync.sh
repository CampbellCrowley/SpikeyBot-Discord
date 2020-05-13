LIST=$(find ./ -name *.DELETEME | sed 's/.DELETEME$//' | tr '\n' ' ')
for i in $LIST; do
  if [ -f "$i" ]; then
    rm "$i"
  fi
done

nice rsync -urpt --rsync-path="nice rsync" --exclude-from="sync-exclude.txt" /home/admin/SpikeyBot-Discord/save/ admin@kamino1:/home/admin/SpikeyBot-Discord/save/ &&\
nice rsync -urpt --rsync-path="nice rsync" --exclude-from="sync-exclude.txt" admin@kamino1:/home/admin/SpikeyBot-Discord/save/ /home/admin/SpikeyBot-Discord/save/

for i in $LIST; do
  if [ -f "$i.DELETEME" ]; then
    rm "$i" "$i.DELETEME"
  fi
done
