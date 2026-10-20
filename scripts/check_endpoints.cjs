const https = require('https');

const paths = [
  '',
  'login',
  'login.php',
  'admin',
  'admin/login.php',
  'member',
  'member/login',
  'retailer',
  'api',
  'index.php',
  'dashboard',
  'panel'
];

async function checkPath(p) {
  return new Promise(resolve => {
    const req = https.request({
      hostname: 'rechargeapp.online',
      path: '/' + p,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path: '/' + p,
          status: res.statusCode,
          length: data.length,
          location: res.headers.location || null,
          title: (data.match(/<title>(.*?)<\/title>/i) || [])[1] || null,
          sample: data.slice(0, 100).replace(/\s+/g, ' ')
        });
      });
    });

    req.on('error', err => resolve({ path: '/' + p, error: err.message }));
    req.end();
  });
}

async function run() {
  for (const p of paths) {
    const res = await checkPath(p);
    console.log(JSON.stringify(res));
  }
}

run();
