const sounds = {}

for(const audio of document.querySelectorAll('audio')) {
  sounds[audio.getAttribute('data-name')] = audio
}

module.exports = sounds
