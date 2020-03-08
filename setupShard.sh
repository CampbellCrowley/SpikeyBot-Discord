echo 'if [ "$TERM" == "tmux" ] && [ "" == "$TMUX" ]; then
  TERM=xterm
fi' >> /root/.bashrc

adduser admin
usermod -aG sudo admin

crontab -l > tmpcrontab
echo '@reboot /usr/bin/sh /home/admin/start.sh' >> tmpcrontab
crontab tmpcrontab
rm tmpcrontab

crontab -u admin -l > tmpcrontab
echo '35 * * * * /usr/bin/sh /home/admin/sync.sh' >> tmpcrontab
crontab -u tmpcrontab
rm tmpcrontab

echo 'if [ "$TERM" == "tmux" ] && [ "" == "$TMUX" ]; then
  TERM=xterm
fi' >> /home/admin/.bashrc
sed -i 's/#force_color_prompt=yes/force_color_prompt=yes/' /home/admin/.bashrc

curl -sL https://deb.nodesource.com/setup_10.x | bash -
apt install git make libtool autoconf g++ ffmpeg nodejs rsync psmisc -y

sudo -u admin git clone https://github.com/CampbellCrowley/SpikeyBot-Discord.git /home/admin/SpikeyBot-Discord/
cd /home/admin/SpikeyBot-Discord
sudo -u admin npm i

sudo -u admin git clone https://github.com/CampbellCrowley/ServerManager.git /home/admin/ServerManager/
cd /home/admin/ServerManager
git checkout SpikeyBot
sudo -u admin npm i

cd /home/admin/

ssh-keygen -t rsa -f /home/admin/.ssh/id_rsa_nopass -q -N ""
echo 'Host kamino1
  Hostname 10.138.62.205
  # Hostname kamino1.campbellcrowley.com
  User admin
  IdentityFile ~/.ssh/id_rsa_nopass' > /home/admin/.ssh/config

ssh-copy-id kamino1

echo 'nice rsync -urpt --rsync-path="nice rsync" --exclude="shards/*" /home/admin/SpikeyBot-Discord/save/ admin@kamino1:/home/admin/SpikeyBot-Discord/save/ &&\
nice rsync -urpt --rsync-path="nice rsync" --exclude="shards/*" admin@kamino1:/home/admin/SpikeyBot-Discord/save/ /home/admin/SpikeyBot-Discord/save/' > /home/admin/sync.sh
chown admin:admin /home/admin/sync.sh
chmod u+x /home/admin/sync.sh

echo 'Syncing user-data... this will take a while.'
sh ./sync.sh

echo '#!/bin/sh
cd /home/admin/ServerManager/
node Starter.js &' > /home/admin/start.sh
chown admin:admin /home/admin/start.sh
chmod u+x /home/admin/start.sh

echo 'Shard requires shard_id_config.json and auth.js to be installed manually.'
echo 'Otherwise, this shard is ready to boot.'
