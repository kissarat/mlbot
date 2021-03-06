#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TARGET=web@inbisoft.com:www/sam/public/download/

export MLBOT=prod
NAME=mlbot
if [ "${MLBOT_VENDOR}" != "" ]; then
    NAME=$MLBOT_VENDOR-mlbot
#    export $MLBOT_VENDOR
fi

pushd $DIR/inject
webpack
popd
pushd $DIR/ui
webpack
popd
rm $DIR/app/js/*.map

pushd /tmp

# Windows 64 bit
electron-packager $DIR/app $NAME --platform=win32 --arch=x64 --asar
mv /tmp/$NAME-win32-x64 /tmp/$NAME
zip -r /tmp/$NAME-windows-64bit.zip $NAME
rm -r /tmp/$NAME
scp /tmp/$NAME-windows-64bit.zip $TARGET
rm /tmp/$NAME-windows-64bit.zip

# Windows 32 bit
#electron-packager $DIR/app $NAME --platform=win32 --arch=ia32 --asar
#mv /tmp/$NAME-win32-ia32 /tmp/$NAME
#zip -9 -r /tmp/$NAME-windows-32bit.zip $NAME
#rm -r /tmp/$NAME
#scp /tmp/$NAME-windows-32bit.zip $TARGET
#rm /tmp/$NAME-windows-32bit.zip

# macOS
#electron-packager $DIR/app $NAME --platform=mas --asar
#mv /tmp/$NAME-mas-x64 /tmp/$NAME
#zip -r /tmp/$NAME-mac.zip /tmp/$NAME
#rm -r /tmp/$NAME
#scp /tmp/$NAME-mac.zip $TARGET
#rm /tmp/$NAME-mac.zip

# Linux 64 bit
electron-packager $DIR/app $NAME --platform=linux --arch=x64 --asar
mv /tmp/$NAME-linux-x64 /tmp/$NAME
7za a /tmp/$NAME-linux-64bit.7z $NAME
rm -r /tmp/$NAME
scp /tmp/$NAME-linux-64bit.7z $TARGET
rm /tmp/$NAME-linux-64bit.7z

# Linux 32 bit
electron-packager $DIR/app $NAME --platform=linux --arch=ia32 --asar
mv /tmp/$NAME-linux-ia32 /tmp/$NAME
7za a /tmp/$NAME-linux-32bit.7z $NAME
rm -r /tmp/$NAME
scp /tmp/$NAME-linux-32bit.7z $TARGET
rm /tmp/$NAME-linux-32bit.7z

popd
