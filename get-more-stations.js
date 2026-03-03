// UAE stations from data
const uaeStations = `OMAA,2026-03-02,54.6511,24.4330
OMDB,2026-03-02,55.3657,25.2532
OMSJ,2026-03-02,55.5174,25.3280
OMAL,2026-03-02,55.6092,24.2617
OMDW,2026-03-02,55.6725,25.2378
OMFJ,2026-03-02,56.3240,25.1122
OMRK,2026-03-02,55.9389,25.6136`.split('\n');

console.log('\nAdditional UAE stations:');
uaeStations.forEach(line => {
  if (!line) return;
  const [code, _, lon, lat] = line.split(',');
  if (!['OMAA', 'OMDB', 'OMSJ', 'OMAL', 'OMDW'].includes(code)) {
    console.log(`'${code}': [${lat.trim()}, ${lon.trim()}], // UAE`);
  }
});

// Kuwait stations
console.log('\nKuwait stations check:');
const kuwaitStations = `OKBK,2026-03-02,47.9689,29.2267
OKAJ,2026-03-02,48.2833,28.9333`.split('\n');

kuwaitStations.forEach(line => {
  if (!line) return;
  const [code, _, lon, lat] = line.split(',');
  if (code !== 'OKBK') {
    console.log(`'${code}': [${lat.trim()}, ${lon.trim()}], // Kuwait`);
  }
});

// Oman stations
console.log('\nOman additional stations:');
const omanStations = `OOMS,2026-03-02,58.2844,23.5933
OOSA,2026-03-02,54.0914,17.0387
OOSH,2026-03-02,56.5333,23.6167
OOKB,2026-03-02,58.8167,22.6667`.split('\n');

omanStations.forEach(line => {
  if (!line) return;
  const [code, _, lon, lat] = line.split(',');
  if (!['OOMS', 'OOSA'].includes(code)) {
    console.log(`'${code}': [${lat.trim()}, ${lon.trim()}], // Oman`);
  }
});
