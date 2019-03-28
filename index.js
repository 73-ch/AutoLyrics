const fs = require('fs');

const AutoLyricsInterface = require('./AutoLyricsInterface');

const interface = new AutoLyricsInterface();


(async () => {
  await interface.startRecognize('./audio/GAME.m4a');

  await interface.selectRecognizedMusic(0);

  const lyrics = await interface.nextDownloadedLyrics();

  console.log(lyrics);

  interface.finishDownloadedLyrics();
})();