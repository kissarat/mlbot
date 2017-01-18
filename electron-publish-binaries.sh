#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
NAME=mlbot
TARGET=web@inbisoft.com:www/sam/public/download/

pushd /tmp

# Windows 64 bit
electron-packager $DIR/app $NAME --platform=win32 --arch=x64
mv /tmp/$NAME-win32-x64 /tmp/$NAME
zip -r /tmp/$NAME-windows-64bit.zip /tmp/$NAME
rm -r /tmp/$NAME
scp /tmp/$NAME-windows-64bit.zip $TARGET
rm /tmp/$NAME-windows-64bit.zip

# Windows 32 bit
electron-packager $DIR/app $NAME --platform=win32 --arch=ia32
mv /tmp/$NAME-win32-ia32 /tmp/$NAME
zip -r /tmp/$NAME-windows-32bit.zip /tmp/$NAME
rm -r /tmp/$NAME
scp /tmp/$NAME-windows-32bit.zip $TARGET
rm /tmp/$NAME-windows-32bit.zip

# macOS
electron-packager $DIR/app $NAME --platform=mas
mv /tmp/$NAME-mas-x64 /tmp/$NAME
zip -r /tmp/$NAME-mac.zip /tmp/$NAME
rm -r /tmp/$NAME
scp /tmp/$NAME-mac.zip $TARGET
rm /tmp/$NAME-mac.zip

# Linux 64 bit
electron-packager $DIR/app $NAME --platform=linux --arch=x64
mv /tmp/$NAME-linux-x64 /tmp/$NAME
7za a /tmp/$NAME-linux-64bit.7z /tmp/$NAME
rm -r /tmp/$NAME
scp /tmp/$NAME-linux-64bit.7z $TARGET
rm /tmp/$NAME-linux-64bit.7z

# Linux 32 bit
electron-packager $DIR/app $NAME --platform=linux --arch=ia32
mv /tmp/$NAME-linux-ia32 /tmp/$NAME
7za a /tmp/$NAME-linux-32bit.7z /tmp/$NAME
rm -r /tmp/$NAME
scp /tmp/$NAME-linux-32bit.7z $TARGET
rm /tmp/$NAME-linux-32bit.7z

popd
