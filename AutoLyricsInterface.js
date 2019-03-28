const fs = require('fs');


const MusicRecognizer = require('./MusicRecognizer');
const LyricsDownloader = require('./LyricsDownloader');

// const recognizer = new MusicRecognizer();
// const bitmap = fs.readFileSync('./audio/GAME.m4a');
// const buffer = Buffer.from(bitmap);

// (async () => {
//   const playingData = await recognizer.identify(buffer);
//
//   console.log(playingData);
//
//   const downloader = new LyricsDownloader();
//
//   await downloader.fetchLyrics(playingData[0].title, playingData[0].artist);
// })();

class AutoLyricsInterface {
  constructor() {
    this.recognizer = new MusicRecognizer();

    this.downloader = new LyricsDownloader();

    this.clearData();
  }

  clearData() {
    this.playingBuffer = null;
    this.recognizedMusics = [];
    this.selectedRecognizedIndex = null;
  }

  checkRecognized (i) {
    if (this.recognizedMusics && this.recognizedMusics[i]){
      return true;
    } else {
      console.error('given index is out of range or you have not recognized any music yet: recognizedMusics');
      return false;
    }
  }

  // 以下のメソッドを順に実行していくことで、目的の歌詞を選択することができる

  async startRecognize(url) {
    const bitmap = fs.readFileSync(url);
    this.playingBuffer = Buffer.from(bitmap);

    this.recognizedMusics = await this.recognizer.identify(this.playingBuffer);

    return this.recognizedMusics;
  }

  async selectRecognizedMusic(i) {
    if (!this.checkRecognized(i)) return false;

    this.selectedRecognizedIndex = i;

    await this.startDownloadLyrics();

    return true;
  }

  async startDownloadLyrics() {
    if (!this.checkRecognized(this.selectedRecognizedIndex)) return false;
    const target = this.recognizedMusics[this.selectedRecognizedIndex];
    await this.downloader.fetchLyrics(target.title, target.artist);

    return true;
  }

  nextDownloadedLyrics() {
    if (this.downloader.generator) {
      return this.downloader.generator.next(false);
    }
  }

  finishDownloadedLyrics() {
    if (this.downloader.generator) {
      this.downloader.generator.next(true);
    }
  }
}

module.exports = AutoLyricsInterface;