#!/bin/sh
echo ""
echo "#######        -----           ###"
echo "#####   Post Update Script   #####"
echo "###         ------         #######"

ENVY="dev-node"
REPO="/var/www/cgi-bin/chat"
HTML="/var/www/cgi-bin/chat/html"

echo ""
echo "Host is stage-node"
echo "User name is $USER"
echo ""

echo "Stopping node.. "
killall node
echo 'DONE'

echo -n "Clearing $HTML directory.. "
rm -rf $HTML/*
echo 'DONE'

echo -n "Copying updates.. "
export GIT_WORK_TREE=$HTML
export GIT_DIR=$REPO
git checkout -f
cp $REPO/.env $HTML/.env
echo 'DONE'

echo -n  "Setting permissions.. "
chmod g+w -R $HTML
echo 'DONE'

echo ""
echo "Installing packages.. "
cd $HTML
npm install
echo 'DONE'

echo ""
echo "Starting node.. "
node chat.js

echo 'DONE'