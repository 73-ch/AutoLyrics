'use strict';
const Nightmare = require('nightmare');
const vo = require('vo');

const TITLE_LINK_SELECTOR = '.bdy .mid a';
const ARTIST_LINK_SELECTOR = '.bdy .sml a';

const LYRIC_SITES = {
  'j-lyric': {
    list: { // 一覧を取得するためのタグなど
      getSearchUrl: (title, artist) => `http://search2.j-lyric.net/index.php?kt=${title}&ct=2&ka=${artist}&ca=2&kl=&cl=2`,
      title_link_selector: '.bdy .mid a',
      artist_link_selector: '.bdy .sml a'
    },
    song: { // 1曲ごとのページのタグなど
      lyric_tag: '#Lyric',
      reformat_lyric: html => html
    }

  },
  'kget': {
    list: {
      getSearchUrl: (title, artist) => `http://www.kget.jp/search/index.php?c=0&r=${artist}&t=${title}&v=&f=`,
      title_link_selector: '#search-result .lyric-anchor',
      artist_link_selector: '#search-result .artist a'
    },
    song: { // 1曲ごとのページのタグなど
      lyric_tag: '#lyric-trunk',
      reformat_lyric: html => html.replace(/<a.*>.*<\/a>/s, '')
    }
  }
};

Object.freeze(LYRIC_SITES);


class LyricsDownloader {
  constructor() {
    this.nightmare = Nightmare({show: true});
    this.site = LYRIC_SITES['kget'];
  }

  async fetchLyricInfos(title, artist) {
    console.log('fetching lyric infos...');
    this.current_title = title;
    this.current_artist = artist;

    const titleTags = await this.getLyricsInfoList(this.site.list.title_link_selector);
    const artistTags = await this.getLyricsInfoList(this.site.list.artist_link_selector);

    if (titleTags.length < 1 || artistTags.length < 1) {
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

  setLyricSite(name) {
    if (LYRIC_SITES[name]) {
      this.site = LYRIC_SITES[name];
      console.log(`current download site is ${name}`);
    } else {
      console.error(`${name} site data is not found`);
    }
  }

  // j-lyricsの特定の曲のリンクから歌詞のテキストのみを抜き出す関数
  getLyricsFromPage(link) {
    console.log('getting a lyric from song page');
    return this.nightmare
      .goto(link)
      .evaluate(selector => {
        return document.querySelector(selector).innerHTML;
      }, this.site.song.lyric_tag).catch(function(e) {
        console.error(e.message);
      });
  }

  // セットされているcurrent_titleとcurrent_artistで検索をかけて
  // 検索結果のリストから必要な情報のみの配列を生成する関数
  getLyricsInfoList(tag) {
    console.log('getting a lyric info list');
    return this.nightmare
      .goto(this.site.list.getSearchUrl(this.current_title, this.current_artist))
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

    const html_data = await this.getLyricsFromPage(song.href);
    const lyric = this.site.song.reformat_lyric(html_data);

    console.log(lyric);

    return {
      title: song.title,
      artist: song.artist,
      lyric: lyric
    };
  }
}

module.exports = LyricsDownloader;