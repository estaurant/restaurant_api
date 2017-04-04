'use strict';

const ES_HOST = process.env.ES_HOST;
const ES_HTTPAUTH = process.env.ES_HTTPAUTH;
const DEFAULT_LAT = process.env.LAT;
const DEFAULT_LON = process.env.LON;
const DEFAULT_DISTANCE = process.env.DISTANCE || '5km';

let DEFAULT_LOCATION = {}

if (DEFAULT_LAT && DEFAULT_LON && DEFAULT_DISTANCE) {
  DEFAULT_LOCATION = {
    lat: parseFloat(DEFAULT_LAT),
    lon: parseFloat(DEFAULT_LON),
    maxDistance: DEFAULT_DISTANCE
  }
}

if (!ES_HOST) {
  throw new Error('missing ES_HOST');
}

if (!ES_HTTPAUTH) {
  throw new Error('missing ES_HTTPAUTH');
}

module.exports = {
  ES_HOST,
  ES_HTTPAUTH,
  DEFAULT_LOCATION
};