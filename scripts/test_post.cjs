const https = require('https');

const endpoints = [
  '/',
  '/login',
  '/api',
  '/api/login',
  '/api/send_otp',
  '/api/otp',
  '/api/v1/login',
  '/api/v1/send_otp',
  '/send_otp',
  '/otp.php',
  '/login.php',
  '/api.php'
];

async function testPost(ep) {
  return new Promise(resolve => {
    const postData = JSON.stringify({
      mobile: '7489674391',
      phone: '7489674391',
      mobile_number: '7489674391',
      username: '7489674391'
    });

    const req = https.request({
      hostname: 'rechargeapp.online',
      path: ep,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'okhttp/4.9.0'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ep,
          status: res.statusCode,
          len: data.length,
          body: data.slice(0, 200)
        });
      });
    });

    req.on('error', err => resolve({ ep, error: err.message }));
    req.write(postData);
    req.end();
  });
}

async function run() {
  for (const ep of endpoints) {
    const res = await testPost(ep);
    console.log(JSON.stringify(res));
  }
}

run();
