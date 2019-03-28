const fs = require('fs');


const MusicRecognizer = require('./MusicRecognizer');
const LyricsDownloader = require('./LyricsDownloader');

const recognizer = new MusicRecognizer();
const bitmap = fs.readFileSync('./audio/GAME.m4a');
const buffer = Buffer.from(bitmap);

(async () => {
  const playingData = await recognizer.identify(buffer);

  console.log(playingData);

  const downloader = new LyricsDownloader();

  await downloader.fetchLyrics(playingData[0].title, playingData[0].artist);
})();