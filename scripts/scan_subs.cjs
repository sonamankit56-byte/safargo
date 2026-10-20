const dns = require('dns');

const subdomains = [
  'api',
  'app',
  'm',
  'panel',
  'portal',
  'admin',
  'user',
  'login',
  'web',
  'auth',
  'b2b',
  'pay'
];

async function checkSub(sub) {
  const host = `${sub}.rechargeapp.online`;
  return new Promise(resolve => {
    dns.resolve4(host, (err, addrs) => {
      if (err) {
        resolve({ host, found: false });
      } else {
        resolve({ host, found: true, addrs });
      }
    });
  });
}

async function run() {
  for (const s of subdomains) {
    const res = await checkSub(s);
    if (res.found) {
      console.log('FOUND SUBDOMAIN:', JSON.stringify(res));
    } else {
      // console.log('Not found:', res.host);
    }
  }
  console.log('DNS scan completed.');
}

run();
