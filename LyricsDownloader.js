const Nightmare = require('nightmare');
const vo = require('vo');

const TITLE_LINK_SELECTOR = '.bdy .mid a';
const ARTIST_LINK_SELECTOR = '.bdy .sml a';


class LyricsDownloader {
  constructor() {
    this.nightmare = Nightmare({show: true});
  }

  async fetchLyrics(title, artist) {
    this.current_title = title;
    this.current_artist = artist;

    const data = await this.runVo().catch(e => {
      console.error('failed to get lyrics');
      console.error(e.message);
      return null;
    });

  }

  runVo() {
    return new Promise((resolve, reject) => {
      vo(this.main())(function(err, result) {
        if (err) reject(err);

        resolve(result);
      });
    })
  }

  // j-lyricsの特定の曲のリンクから歌詞のテキストのみを抜き出す関数
  getLyricsFromPage(link) {
    return this.nightmare
      .goto(link)
      .evaluate(selector => {
        return document.querySelector(selector).textContent.replace('<br>', '');
      }, '#Lyric');
  }

  // セットされているcurrent_titleとcurrent_artistで検索をかけて
  // 検索結果のリストから必要な情報のみの配列を生成する関数
  getLyricsInfoList(tag) {
    return this.nightmare
      .goto(`http://search2.j-lyric.net/index.php?kt=${this.current_title}&ct=2&ka=${this.current_artist}&ca=2&kl=&cl=2`)
      .evaluate(selector => {
        return Array.from(document.querySelectorAll(selector)).map(a => ({textContent: a.textContent, href: a.href}));
      }, tag);
  }

  * main() {
    const titleTags = yield this.getLyricsInfoList(TITLE_LINK_SELECTOR);
    const artistTags = yield this.getLyricsInfoList(ARTIST_LINK_SELECTOR);

    const infos = yield titleTags.map((title, i) => {
      return {
        title: title.textContent,
        href: title.href,
        artist: artistTags[i].textContent
      };
    });

    // console.log(infos);

    for (let l of infos) {
      const lyric = yield this.getLyricsFromPage(l.href);
      console.log(`
      ${l.title}  :  ${l.artist}
      
      ${lyric}
       -----------------------------------------------------------------------
      `);

    }

    yield this.nightmare.end();
    return true;
  }
}

module.exports = LyricsDownloader;