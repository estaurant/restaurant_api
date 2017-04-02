'use strict';

const getClient = require('../es/client')
const { calculateDistance } = require('../utils/geo_util')
const { getDayOfWeek, getTime } = require('../utils/date_util')
const Config = require('../config')
const { buildBoolQ, 
    buildGeoQ, 
    buildMatchQ, 
    buildMustQ, 
    buildNestedQ, 
    buildRangeQ,
    buildWildCardQ} = require('../es/query')

let indexName = 'estaurant';
let indexType = 'restaurant';

class EsRestaurantService {
    constructor() {
        this.client = getClient();
    }

    findByPrice(userId, limitPrice) {
        let opts = {
            limitPrice,
            location: Config.DEFAULT_LOCATION
        };

        let q = buildQuery(opts);

        return find(this.client, q);
    }

    findByKeyword(userId, keyword) {
        let opts = {
            keyword,
            location: Config.DEFAULT_LOCATION
        };

        let q = buildQuery(opts);

        return find(this.client, q);
    };

    findByDistance(userId, maxDistance, opts) {
        opts = Object.assign(opts, {
            location: Object.assign(Config.DEFAULT_LOCATION, {maxDistance}),
        });

        let q = buildQuery(opts);

        return find(this.client, q);
    };

    find(userId, opts, moreOpts) {
        opts = Object.assign({
            location: Config.DEFAULT_LOCATION
        }, opts, moreOpts);

        let q = buildQuery(opts);

        return find(this.client, q);
    };
}

const buildQuery = (opts) => {
    opts = Object.assign({
        dayOfWeek: getDayOfWeek(),
        timeOfDay: getTime(),
    }, opts);

    let filters = [];

    if (opts.location) {
        let geoQ = buildGeoQ(opts.location);
        filters.push(geoQ);
    }

    if (opts.limitPrice) {
        let priceQ = buildRangeQ("priceRange.high", "lte", opts.limitPrice);
        filters.push(priceQ);
    }

    if (opts.timeOfDay && opts.dayOfWeek) {
        let mustTimesQ = [
            buildRangeQ(`times.${opts.dayOfWeek}.open`, "lte", opts.timeOfDay),
            buildRangeQ(`times.${opts.dayOfWeek}.close`, "gte", opts.timeOfDay)
        ];
        let timesQ = buildNestedQ(`times.${opts.dayOfWeek}`, buildBoolQ({ must: mustTimesQ }));
        filters.push(timesQ);
    }

    let mustQ = [];

    if (opts.keyword) {
        let keywordQ;

        if(opts.keyword.indexOf(' ') > -1){
            keywordQ = buildMatchQ(opts.keyword);
        }else{
            keywordQ = buildWildCardQ(opts.keyword);
        }
        mustQ.push(keywordQ);
    }

    let q = {
        "query": buildBoolQ({ must: mustQ, filter: filters })
    };

    if(opts.from !== undefined) q.from = opts.from;
    if(opts.size !== undefined) q.size = opts.size;

    console.log('build q: ', JSON.stringify(q));

    return q;
}

const find = (client, q) => {
    return client.search({ index: indexName, body: q })
        .then(
            (results) => {
                console.log('Found:',results);
                return results;
            },
            (errors) => console.error(errors));
}

module.exports = EsRestaurantService;