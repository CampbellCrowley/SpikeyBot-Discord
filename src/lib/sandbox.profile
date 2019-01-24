quiet

include /etc/firejail/disable-common.inc
include /etc/firejail/disable-passwdmgr.inc
include /etc/firejail/disable-programs.inc

caps.drop all
seccomp
net none
apparmor
disable-mnt
ipc-namespace
hostname sandbox
shell none

nice 39

nosound
noroot
notv
novideo
nogroups
nonewprivs
nou2f

private
private-bin node,SBnode,python,SBpython
private-cache
private-dev
private-etc none
private-lib
private-tmp

blacklist /var/www
blacklist /var/backups
blacklist /backups

# Timeout is 1 minute, but sandbox.js is expected to abort execution at 30 (ish)
# seconds. This is an additional fallback in case something is broken.
timeout 00:01:00
