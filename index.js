const fs = require('fs');
const Max = require("max-api");

const AutoLyricsInterface = require('./AutoLyricsInterface');

const interface = new AutoLyricsInterface();

const RECOGNIZED_DICT_ID = "recognized";
const DOWNLOADED_DICT_ID = "downloaded";


// (async () => {
//   await interface.startRecognize('./audio/GAME.m4a');
//
//   await interface.selectRecognizedMusic(0);
//
//   const lyrics = await interface.nextDownloadedLyrics();
//
//   console.log(lyrics);
//   Max.post(lyrics);
//
//   interface.finishDownloadedLyrics();
// })();

const outputDictAndBang = (dictId, content, outputObj) => {
  Max.setDict(dictId, {...content}).then(() => {
    Max.outlet(...outputObj);
  }).catch(e => {
    console.error(e.message);
  });
};

Max.addHandler("startRecognize", async url => {
  const recognizedList = await interface.startRecognize(url);

  if (!recognizedList) {
    Max.outlet('any lyrics founded on recognizing');
    return false;
  }

  console.log(recognizedList);

  outputDictAndBang(RECOGNIZED_DICT_ID, recognizedList, ["recognized", "bang"]);
});

Max.addHandler("selectRecognizedMusic", async i => {
  const downloadedList = await interface.selectRecognizedMusic(i);

  if (!downloadedList) {
    Max.outlet('any lyrics founded on downloading');
    return false;
  }

  outputDictAndBang(DOWNLOADED_DICT_ID, downloadedList, ["downloaded", "bang"]);
});

Max.addHandler("selectDownloadedLyric", async i => {
  const songInfo = await interface.selectDownloadLyrics(i);

  Max.outlet('song_data', 'title', songInfo['title']);
  Max.outlet('song_data', 'artist', songInfo['artist']);
  Max.outlet('song_data', 'lyric', songInfo['lyric']);
});

Max.addHandler("nextDownloadedLyrics", async () => {
  const lyrics = await interface.nextDownloadedLyrics();
  if (lyrics) {
    Max.outlet('no lyrics found');
    return false;
  }
  console.log(lyrics);
  Max.outlet(...Object.values(lyrics));
});

Max.addHandler("finishDownloadedLyrics", async () => {
  interface.finishDownloadedLyrics();
});