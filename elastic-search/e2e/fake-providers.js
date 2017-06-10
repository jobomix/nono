var Importer = require('elastic-import/lib/importer');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var sleep = require('sleep');
var sr = require('sync-request');
var es = require('elasticsearch');

const index = 'users';

const bulkSize = 100;
var counter = 1;

var importer = new Importer({
  host: 'http://localhost:9200',
  index: index,
  type: 'providers',
  transform: function (record) {
    console.log(`importing record ${counter}`);
    record.geodata = osmGeocoding(record);
    record._id = counter++;
    sleep.sleep(1);
  }
});

var client = new es.Client({
  host: 'localhost:9200',
  log: 'trace'
})

function exist() {
  return client.indices.exists({
    index: index
  });
}

function clear() {
  return client.indices.delete({
    index: index
  })
}

var osmGeocoding = function (record) {
  var lat = record.location.lat;
  var lon = record.location.lon;
  var url = `http://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  var res = sr('GET', url, {
    'headers': {
      'user-agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
    }
  });
  var address = JSON.parse(res.getBody('utf8'));
  return address;
}

var createIndex = function () {
  return client.indices.create({
    index: index,
    body: {
      "settings": {
        "number_of_shards": 1,
        "index.write.wait_for_active_shards": "1"
      },
      "mappings": {
        "providers": {
          "properties": {
            "location": {
              "type": "geo_point"
            }
          }
        }
      }
    }
  });
}

var importProviders = function () {

  var importAll = function (value) {
    return new Promise((resolve, reject) => {
      console.log('Importing providers into users index');
      data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'fake-providers.json')));
      importData(data);
      resolve(value)
    });
  }

  exist().then(
    success => {
      if (success === true) {
        clear().then(createIndex).then(importAll);
      } else {
        createIndex().then(importAll);
      }
    },
    error => {
      console.log(error);
    });
}
var importData = function (data) {
  if (!_.isArray(data) || data.length < bulkSize) {
    importer.import(data)
  } else {
    while (true) {
      if (data.length === 0) {
        break
      }
      var partial = data.splice(0, bulkSize)
      importer.import(partial)
      console.log('sent', partial.length)
    }
  }
}

module.exports.importProviders;

importProviders();
