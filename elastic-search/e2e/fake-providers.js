var Importer = require('elastic-import/lib/importer');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

const bulkSize = 100;

var importer = new Importer({
  host: 'http://localhost:9200',
  index: 'users',
  type: 'providers',
  transform: function(record) {
    console.log(record);
    record.area = 'added some area';
    return record;
  }
});

var client = importer.client;

function exist(index) {
  return client.indices.exists({
    index: 'users'
  });
}

function clear(index) {
  return client.indices.delete({
    index: 'users'
  })
}

var importProviders = function() {
  var importAll = function() {
    console.log('Importing providers into users index');
    data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'fake-providers.json')));
    importData(data);
  }
  client.indices.exists(
  { index: 'users' },
  (error, response) => {
    if (error) {
      console.log(error);
    }
    if (response === true) {
      console.log('Deleting users index');
      clear('users').then(importAll);
    } else {
      importAll();
    }
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
