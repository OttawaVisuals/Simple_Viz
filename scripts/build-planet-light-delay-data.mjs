import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const OUT_DIR = path.resolve('data/planet-light-delay');
const DAILY_FILE = path.join(OUT_DIR, 'jpl-daily-2000-2050.csv');
const SUMMARY_FILE = path.join(OUT_DIR, 'planet-light-delay-summary.json');
const C_KM_S = 299792.458;

const OBJECTS = [
  { name: 'Sun', id: '10' },
  { name: 'Mercury', id: '199' },
  { name: 'Venus', id: '299' },
  { name: 'Mars', id: '499' },
  { name: 'Jupiter', id: '599' },
  { name: 'Saturn', id: '699' },
  { name: 'Uranus', id: '799' },
  { name: 'Neptune', id: '899' }
];

function quoted(value) {
  return `'${value}'`;
}

function horizonsUrl(params) {
  const search = new URLSearchParams({ format: 'text' });
  for (const [key, value] of Object.entries(params)) search.set(key, quoted(value));
  return `${API}?${search}`;
}

async function fetchText(url, attempt = 1) {
  const response = await fetch(url, { headers: { 'user-agent': 'madeclear-data-build/1.0' } });
  if (!response.ok) {
    if (attempt < 4) {
      await new Promise(resolve => setTimeout(resolve, attempt * 1500));
      return fetchText(url, attempt + 1);
    }
    throw new Error(`Horizons returned ${response.status}: ${response.statusText}`);
  }
  return response.text();
}

function parseVectorTable(text) {
  const match = text.match(/\$\$SOE\s*([\s\S]*?)\s*\$\$EOE/);
  if (!match) throw new Error(`Could not find a Horizons data table.\n${text.slice(0, 800)}`);
  return match[1].trim().split(/\r?\n/).filter(Boolean).map(line => {
    const cells = line.split(',').map(cell => cell.trim());
    if (cells.length < 8) throw new Error(`Unexpected Horizons row: ${line}`);
    return {
      jd: Number(cells[0]),
      date: cells[1].replace(/^A\.D\.\s*/, ''),
      x: Number(cells[2]),
      y: Number(cells[3]),
      z: Number(cells[4]),
      lightSeconds: Number(cells[5]),
      distanceKm: Number(cells[6]),
      rangeRateKmS: Number(cells[7])
    };
  });
}

async function fetchSpan(object, start, stop, step) {
  const url = horizonsUrl({
    COMMAND: object.id,
    OBJ_DATA: 'NO',
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'VECTORS',
    CENTER: '500@399',
    START_TIME: start,
    STOP_TIME: stop,
    STEP_SIZE: step,
    TIME_TYPE: 'UT',
    OUT_UNITS: 'KM-S',
    VEC_TABLE: '4',
    CSV_FORMAT: 'YES',
    VEC_LABELS: 'NO'
  });
  return parseVectorTable(await fetchText(url));
}

async function fetchAtJulianDates(object, jds) {
  const tlist = jds.map(jd => jd.toFixed(12)).join(',');
  const url = horizonsUrl({
    COMMAND: object.id,
    OBJ_DATA: 'NO',
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'VECTORS',
    CENTER: '500@399',
    TLIST: tlist,
    TLIST_TYPE: 'JD',
    TIME_TYPE: 'UT',
    OUT_UNITS: 'KM-S',
    VEC_TABLE: '4',
    CSV_FORMAT: 'YES',
    VEC_LABELS: 'NO'
  });
  return parseVectorTable(await fetchText(url));
}

function dateOnly(horizonsDate) {
  const match = horizonsDate.match(/(\d{4})-([A-Z][a-z]{2})-(\d{2})/);
  if (!match) throw new Error(`Unexpected Horizons date: ${horizonsDate}`);
  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  return new Date(Date.UTC(Number(match[1]), months[match[2]], Number(match[3])));
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 86400000);
}

function vectorChangeKm(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
}

function csvNumber(value) {
  return Number(value).toPrecision(15).replace(/\.?(0+)$/, '');
}

async function addMovement(object, sample, distanceKm = sample.distanceKm) {
  const lightSeconds = distanceKm / C_KM_S;
  const emissionJd = sample.jd - lightSeconds / 86400;
  const [emission, observation] = await fetchAtJulianDates(object, [emissionJd, sample.jd]);
  return {
    date: sample.date,
    julianDateUt: sample.jd,
    distanceKm,
    lightSeconds,
    relativePositionChangeKm: vectorChangeKm(emission, observation)
  };
}

async function refineExtremum(object, dailySample, mode) {
  const day = dateOnly(dailySample.date);
  const rows = await fetchSpan(object, isoDate(addDays(day, -2)), isoDate(addDays(day, 2)), '1h');
  return rows.reduce((best, row) => {
    if (!best) return row;
    return mode === 'min'
      ? (row.distanceKm < best.distanceKm ? row : best)
      : (row.distanceKm > best.distanceKm ? row : best);
  }, null);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const allRows = [];
  const summaries = {};

  for (const object of OBJECTS) {
    process.stdout.write(`Downloading ${object.name} daily vectors... `);
    const daily = await fetchSpan(object, '2000-01-01', '2050-12-31', '1d');
    console.log(`${daily.length.toLocaleString()} rows`);
    for (const row of daily) allRows.push({ object: object.name, objectId: object.id, ...row });

    const meanDistance = daily.reduce((sum, row) => sum + row.distanceKm, 0) / daily.length;
    const minDaily = daily.reduce((best, row) => row.distanceKm < best.distanceKm ? row : best);
    const maxDaily = daily.reduce((best, row) => row.distanceKm > best.distanceKm ? row : best);
    const meanSample = daily.reduce((best, row) =>
      Math.abs(row.distanceKm - meanDistance) < Math.abs(best.distanceKm - meanDistance) ? row : best
    );

    process.stdout.write(`Refining ${object.name} extrema and movement... `);
    const minSample = await refineExtremum(object, minDaily, 'min');
    const maxSample = await refineExtremum(object, maxDaily, 'max');
    const [minimum, average, maximum] = await Promise.all([
      addMovement(object, minSample),
      addMovement(object, meanSample, meanDistance),
      addMovement(object, maxSample)
    ]);
    summaries[object.name] = {
      horizonsId: object.id,
      sampleCount: daily.length,
      meanDailyDistanceKm: meanDistance,
      presets: { minimum, average, maximum }
    };
    console.log('done');
  }

  const header = 'object,horizons_id,julian_date_ut,date_ut,x_km,y_km,z_km,light_seconds,distance_km,range_rate_km_s';
  const csvRows = allRows.map(row => [
    row.object, row.objectId, row.jd.toFixed(9), row.date,
    csvNumber(row.x), csvNumber(row.y), csvNumber(row.z),
    csvNumber(row.lightSeconds), csvNumber(row.distanceKm), csvNumber(row.rangeRateKmS)
  ].join(','));
  await writeFile(DAILY_FILE, `${header}\n${csvRows.join('\n')}\n`, 'utf8');

  const output = {
    source: 'NASA/JPL Horizons',
    sourceUrl: 'https://ssd.jpl.nasa.gov/horizons/',
    apiDocumentation: 'https://ssd-api.jpl.nasa.gov/doc/horizons.html',
    generatedAt: new Date().toISOString(),
    interval: { start: '2000-01-01 00:00 UT', end: '2050-12-31 00:00 UT' },
    method: {
      dailySampling: 'Geometric Earth-centered vectors sampled every 1 day; arithmetic mean of daily ranges.',
      extrema: 'Minimum and maximum daily candidates refined over a ±2 day window at 1-hour intervals.',
      averagePreset: 'Arithmetic mean daily range; movement uses the observation nearest that mean and the mean-range light delay.',
      movement: 'Magnitude of the change in the geometric Earth-to-object vector between emission and observation times.',
      speedOfLightKmS: C_KM_S
    },
    objects: summaries
  };
  await writeFile(SUMMARY_FILE, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.relative(process.cwd(), DAILY_FILE)}`);
  console.log(`Wrote ${path.relative(process.cwd(), SUMMARY_FILE)}`);
}

main().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
