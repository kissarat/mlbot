import Skyweb = require('../skyweb')

async function run() {
    const skype = new Skyweb()
    await skype.login('kissarat', 'tX*82yU#1+')
    await skype.sendMessage(// '19:c0f3d5ed5a094c6892540f909d374817@thread.skype',
        '8:taradox89',
        'Hello from MLBot 2')
}

run()
