const fs = require('fs');

async function getNextScripts() {
  const res = await fetch('https://paybeez.in/quick-recharge?n=7489674391');
  const html = await res.text();
  const scripts = [...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map(m => m[1]);
  console.log('Found scripts:', scripts.length);

  for (const s of scripts) {
    const sRes = await fetch('https://paybeez.in' + s);
    const txt = await sRes.text();
    const v1 = [...txt.matchAll(/\/v1\/[a-zA-Z0-9_\-\/]+/g)].map(x => x[0]);
    const unique = [...new Set(v1)];
    if (unique.length > 0) {
      console.log('Script:', s);
      console.log('Endpoints:', unique);
    }
  }
}

getNextScripts().catch(console.error);
