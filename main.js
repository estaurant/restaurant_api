'use strict';

const bodyParser = require('body-parser');
const express = require('express');

const EsRestaurantService = require('./services/esRestaurant.service');
const service = new EsRestaurantService();
const Config = require('./config');
const DEFAULT_USER = 'user1';

const PORT = process.env.PORT || 8445;

const app = express();
app.listen(PORT);
app.use(bodyParser.json());
console.log("I'm ready to serve @" + PORT);

app.get('/', function(req, res) {
  res.send('Hello');
});

app.get('/estaurants', function(req, res) {
    let q = {};

    if(req.query.keyword){
        q.keyword = req.query.keyword;
    }

    if(req.query.distance){
        q.location = Object.assign(Config.DEFAULT_LOCATION, {maxDistance: req.query.distance});
    }

    if(req.query.price){
        q.limitPrice = req.query.price;
    }

    if(req.query.random){
        pickOne(res, q);
        return;
    }

    if(!Object.keys(q).length){
        q.location = Object.assign(Config.DEFAULT_LOCATION, {maxDistance: '300m'});

        pickOne(res, q);
    }else{
        search(res, q);
    }
    
});

const search = (res, opts) => {
    service.find(DEFAULT_USER, opts, {timeOfDay:''})
    .then( results => {
        res.send(results.hits.hits);
    })
    .catch( error => {
        res.status(500).send(error);
    })
}

const pickOne = (res, opts) => {
    service.find(DEFAULT_USER, opts, {size: 0, timeOfDay:''})
    .then( results => {
        let total = results.hits.total;
        let r = getRandomInt(0, total - 1);

        console.log('Pick index: ', r);

        return service.find(DEFAULT_USER, opts, {from: r, size: 1, timeOfDay:''})
        .then(results => {
            res.json(results.hits.hits[0]);
        });
    })
    .catch( error => {
        res.status(500).send(error);
    })
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}