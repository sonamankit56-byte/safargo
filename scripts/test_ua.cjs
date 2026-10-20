const https = require('https');

const userAgents = [
  'okhttp/4.9.0',
  'Dalvik/2.1.0 (Linux; U; Android 12; Pixel 6 Build/SD1A.210817.036)',
  'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Dart/2.18 (dart:io)'
];

async function checkUa(ua) {
  return new Promise(res => {
    https.get('https://rechargeapp.online/', {
      headers: {
        'User-Agent': ua,
        'Accept': '*/*'
      }
    }, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => res({ ua: ua.slice(0, 20), status: r.statusCode, len: d.length, preview: d.slice(0, 60) }));
    }).on('error', e => res({ err: e.message }));
  });
}

async function start() {
  for (const u of userAgents) {
    const r = await checkUa(u);
    console.log(r);
  }
}

start();
