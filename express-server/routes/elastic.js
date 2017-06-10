const elasticsearch = require('elasticsearch');
const express = require('express');
const router = express.Router();


const client = elasticsearch.Client({
  hosts: [`${process.env.ES_HOST}`],
  log: 'trace'
});

client.ping({
  // ping usually has a 3000ms timeout
  requestTimeout: 3000
}, function (error) {
  if (error) {
    console.trace('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});

router.get('/', (req, res) => {
  res.send('api works');
});

router.get('/users', (req, res) => {
  client.search({
    index: 'users',
    type: 'providers',
    _source: ['tweet_desc','main_photo_link']
  }).then(function (resp) {
    var hits = resp.hits.hits;

    res.send(hits);
  }, function (err) {
    console.trace(err.message);
  });
});

module.exports = router;
