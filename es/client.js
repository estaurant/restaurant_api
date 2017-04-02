'use strict';

var elasticsearch = require('elasticsearch');
const Config = require('../config');

const getClient = () => {
    return new elasticsearch.Client({
        host: Config.ES_HOST,
        httpAuth: Config.ES_HTTPAUTH
    });
}

module.exports = getClient;