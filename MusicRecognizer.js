'use strict';
const fs = require('fs');
const crypto = require('crypto');
const request = require('request-promise');

const API_INFO = require('./api_info.json');

const sign = (signString, accessSecret) => {
  return crypto.createHmac('sha1', accessSecret).update(Buffer.from(signString, 'utf-8')).digest().toString('base64');
};

class MusicRecognizer {
  constructor() {
    this.endpoint = '/v1/identify';
    this.signature_version = '1';
    this.data_type = 'audio';
    this.secure = true;
  }

  async identify(sample) {
    const timestamp = Date.now();

    const stringToSign = ['POST', this.endpoint,API_INFO.access_key,this.data_type,this.signature_version,timestamp].join('\n');

    const signature = sign(stringToSign, API_INFO.access_secret);

    const formData = {
      sample: sample,
      access_key: API_INFO.access_key,
      data_type: this.data_type,
      signature_version: this.signature_version,
      signature: signature,
      sample_bytes: sample.length,
      timestamp: timestamp
    };

    const body =  await request.post({
      url: `http://${API_INFO.host}${this.endpoint}`,
      method: 'POST',
      formData: formData
    }).catch(e => {
      console.error('failed to get music data', e.message);
      return e;
    });

    return this.extractMetaData(JSON.parse(body));
  }

  extractMetaData(data) {
    const musics = data.metadata.music;

    return musics.map(m => {
      return {
        title: m.title,
        artist: m.artists[0] ? m.artists[0].name : ''
      }
    });
  }
}

module.exports = MusicRecognizer;