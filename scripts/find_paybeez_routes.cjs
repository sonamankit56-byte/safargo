const https = require('https');

https.get('https://paybeez.in/_next/static/chunks/0d3shmwh5_nmn.js', (res) => {
  let content = '';
  res.on('data', c => content += c);
  res.on('end', () => {
    const apiMatches = content.match(/["'](\/[^"']*recharge[^"']*)["']/g) || [];
    console.log('Matches in 0d3shmwh5_nmn.js:', Array.from(new Set(apiMatches)));
  });
});
