async function inspectPlanObject() {
  const phone = '7489674391';
  const res = await fetch('https://api.paybeez.in/v1/recharge/prepaid/plans-auto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile: phone })
  });
  const json = await res.json();
  const popular = json.data.plans.groups.find(g => g.type === 'popular') || json.data.plans.groups[0];
  console.log('Sample 2 plans in Popular:');
  console.log(JSON.stringify(popular.plans.slice(0, 2), null, 2));
}

inspectPlanObject();
