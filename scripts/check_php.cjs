const https = require('https');

const files = [
  'login.php',
  'api.php',
  'recharge.php',
  'ajax.php',
  'app.php',
  'auth.php',
  'user.php',
  'register.php',
  'main.php',
  'home.php'
];

async function check(f) {
  return new Promise(res => {
    https.get('https://rechargeapp.online/' + f, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => res({ f, status: r.statusCode, len: d.length }));
    }).on('error', e => res({ f, err: e.message }));
  });
}

async function start() {
  for (const f of files) {
    const r = await check(f);
    console.log(r);
  }
}
start();
