'use strict';
const Nightmare = require('nightmare');
const vo = require('vo');

const TITLE_LINK_SELECTOR = '.bdy .mid a';
const ARTIST_LINK_SELECTOR = '.bdy .sml a';


class LyricsDownloader {
  constructor() {
    this.nightmare = Nightmare({show: false});
  }

  async fetchLyricInfos(title, artist) {
    console.log('fetching lyric infos...');
    this.current_title = title;
    this.current_artist = artist;

    const titleTags = await this.getLyricsInfoList(TITLE_LINK_SELECTOR);
    const artistTags = await this.getLyricsInfoList(ARTIST_LINK_SELECTOR);

    if (titleTags.length < 1 || artistTags.length  < 1) {
      console.error(`no lyric info of ${title} - ${artist}`);
    }

    this.song_infos = titleTags.map((title, i) => {
      return {
        title: title.textContent,
        href: title.href,
        artist: artistTags[i].textContent
      };
    });
  }

  // j-lyricsの特定の曲のリンクから歌詞のテキストのみを抜き出す関数
  getLyricsFromPage(link) {
    console.log('getting a lyric from song page');
    return this.nightmare
      .goto(link)
      .evaluate(selector => {
        return document.querySelector(selector).innerHTML;
      }, '#Lyric');
  }

  // セットされているcurrent_titleとcurrent_artistで検索をかけて
  // 検索結果のリストから必要な情報のみの配列を生成する関数
  getLyricsInfoList(tag) {
    console.log('getting a lyric info list');
    return this.nightmare
      .goto(`http://search2.j-lyric.net/index.php?kt=${this.current_title}&ct=2&ka=${this.current_artist}&ca=2&kl=&cl=2`)
      .evaluate(selector => {
        return Array.from(document.querySelectorAll(selector)).map(a => ({
          textContent: a.textContent,
          href: a.href
        }));
      }, tag);
  }

  async specifyLyric(i) {
    if (!this.song_infos || !this.song_infos[i]) {
      console.error('given index is out of range or you have not recognized any music yet: recognizedMusics');

      return false;
    }
    const song = this.song_infos[i];
    console.log('select song', song);

    const lyric = await this.getLyricsFromPage(song.href);

    return {
      title: song.title,
      artist: song.artist,
      lyric: lyric
    };
  }
}

module.exports = LyricsDownloader;