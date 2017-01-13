#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

pushd /tmp
electron-packager $DIR/app mlbot --platform=win32
#zip -r /tmp/mlbot-win32-x64.zip /tmp/mlbot-win32-x64
#rm -r /tmp/mlbot-win32-x64
#scp /tmp/mlbot-win32-x64.zip web@mlbot.inbisoft.ga:www/sam/public/download
#rm /tmp/mlbot-win32-x64.zip
7za a /tmp/mlbot-win32-x64.7z /tmp/mlbot-win32-x64
rm -r /tmp/mlbot-win32-x64
scp /tmp/mlbot-win32-x64.7z web@mlbot.inbisoft.ga:www/sam/public/download
rm /tmp/mlbot-win32-x64.7z
popd
echo http://mlbot.inbisoft.ga/download/mlbot-win32-x64.zip
