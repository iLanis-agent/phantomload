/* PhantomLoad engine - annual cost of always-on devices. */
const PhantomEngine = (() => {
  'use strict';

  // Typical draws (watts) from public energy-audit figures.
  const LIBRARY = [
    { id: 'cablebox',   name: 'Cable / DVR box',        standbyW: 25, activeW: 30,  activeHrs: 5 },
    { id: 'router',     name: 'Wi-Fi router',           standbyW: 10, activeW: 10,  activeHrs: 24 },
    { id: 'tv',         name: 'TV (standby)',           standbyW: 3,  activeW: 100, activeHrs: 4 },
    { id: 'console',    name: 'Game console (rest)',    standbyW: 10, activeW: 120, activeHrs: 2 },
    { id: 'desktop',    name: 'Desktop PC (sleep)',     standbyW: 5,  activeW: 200, activeHrs: 6 },
    { id: 'laptop',     name: 'Laptop charger plugged', standbyW: 4,  activeW: 60,  activeHrs: 8 },
    { id: 'microwave',  name: 'Microwave (clock)',      standbyW: 3,  activeW: 1000, activeHrs: 0.2 },
    { id: 'coffee',     name: 'Coffee maker (clock)',   standbyW: 2,  activeW: 900, activeHrs: 0.3 },
    { id: 'printer',    name: 'Printer (idle)',         standbyW: 5,  activeW: 300, activeHrs: 0.2 },
    { id: 'speaker',    name: 'Smart speaker',          standbyW: 3,  activeW: 5,   activeHrs: 3 },
    { id: 'chargers',   name: 'Phone chargers x4',      standbyW: 2,  activeW: 15,  activeHrs: 4 },
    { id: 'monitor',    name: 'Monitor (standby)',      standbyW: 2,  activeW: 40,  activeHrs: 6 },
    { id: 'soundbar',   name: 'Soundbar (standby)',     standbyW: 6,  activeW: 30,  activeHrs: 3 },
    { id: 'washer',     name: 'Washer (standby)',       standbyW: 2,  activeW: 500, activeHrs: 0.5 },
    { id: 'garage',     name: 'Garage door opener',     standbyW: 5,  activeW: 300, activeHrs: 0.05 },
    { id: 'aquarium',   name: 'Aquarium pump',          standbyW: 8,  activeW: 8,   activeHrs: 24 }
  ];

  function normDevice(d) {
    if (!d || typeof d.name !== 'string' || !d.name.trim()) throw new Error('device needs a name');
    const num = (v, label, max) => {
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0 || n > max) throw new Error(label + ' must be 0-' + max);
      return n;
    };
    const standbyW = num(d.standbyW, 'standby watts', 2000);
    const activeW = num(d.activeW, 'active watts', 5000);
    const activeHrs = num(d.activeHrs, 'active hours', 24);
    return { name: d.name.trim(), standbyW: standbyW, activeW: activeW, activeHrs: activeHrs };
  }

  // kWh per year for one device: standby draw covers the hours it is not active.
  function annualKwh(d) {
    const standbyHrs = 24 - d.activeHrs;
    return (d.standbyW * standbyHrs + d.activeW * d.activeHrs) / 1000 * 365;
  }

  // The "phantom" share: what the standby draw alone costs per year.
  function phantomKwh(d) {
    return d.standbyW * (24 - d.activeHrs) / 1000 * 365;
  }

  function audit(devices, pricePerKwh, co2PerKwh) {
    const price = Number(pricePerKwh);
    if (!Number.isFinite(price) || price < 0 || price > 10) throw new Error('price must be 0-10 per kWh');
    const co2f = (co2PerKwh === undefined || co2PerKwh === null || co2PerKwh === '') ? 0.4 : Number(co2PerKwh);
    if (!Number.isFinite(co2f) || co2f < 0 || co2f > 5) throw new Error('co2 factor must be 0-5');
    const rows = devices.map(d0 => {
      const d = normDevice(d0);
      const kwh = annualKwh(d);
      const phantom = phantomKwh(d);
      return {
        name: d.name,
        annualKwh: kwh,
        phantomKwh: phantom,
        annualCost: kwh * price,
        phantomCost: phantom * price,
        co2Kg: kwh * co2f
      };
    });
    rows.sort((a, b) => b.annualCost - a.annualCost);
    const tot = rows.reduce((s, r) => ({
      annualKwh: s.annualKwh + r.annualKwh,
      phantomKwh: s.phantomKwh + r.phantomKwh,
      annualCost: s.annualCost + r.annualCost,
      phantomCost: s.phantomCost + r.phantomCost,
      co2Kg: s.co2Kg + r.co2Kg
    }), { annualKwh: 0, phantomKwh: 0, annualCost: 0, phantomCost: 0, co2Kg: 0 });
    return { rows: rows, total: tot, pricePerKwh: price, co2PerKwh: co2f,
      phantomShare: tot.annualCost > 0 ? tot.phantomCost / tot.annualCost : 0 };
  }

  return { LIBRARY, normDevice, annualKwh, phantomKwh, audit };
})();
if (typeof module !== 'undefined') module.exports = PhantomEngine;
