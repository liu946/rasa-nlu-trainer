#! /usr/bin/env node
'use strict';

// @flow
"use strict"
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json({ limit: '50mb' }))
const findit = require('findit')
const getPort = require('get-port')
const open = require('open')

const updateNotifier = require('update-notifier')
const pkg = require('./package.json')

updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 24 // one day
}).notify()

const fs = require('fs')
const argv = require('yargs')
  .usage('This is my awesome program\n\nUsage: $0 [options]')
  .help('help').alias('help', 'h')
  .options({
    source: {
      alias: 's',
      description: '<filename> A json file in native rasa-nlu format',
      requiresArg: true,
    },
    port: {
      alias: 'p',
      description: '<port> Port to listen on',
      requiresArg: true,
    },
    development: {
      alias: 'd',
    }
  })
  .default({
    source: null,
    port: null,
    development: false,
  })
  .argv

const sourceFiles = {};
function newSourceFile(path='', data={}, isLoaded=false) {
   return {
     path: path,
     data: data,
     isLoaded: isLoaded,
   }
}

function readData(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (error, raw) => {
    var json = {};

      if (error) {
        return reject(`Can't read file "${path}"\n${error}`)
      }

      try {
        json = JSON.parse(raw)
      }
      catch (error) {
        return reject(`Can't parse json file "${path}"\n${error}`)
      }

      if (!json.rasa_nlu_data) {
        return reject('"rasa_nlu_data" is undefined')
      }

      resolve(json)
    })
  })
}

function extractFile(file) {
  if (!sourceFiles[path.basename(file)]) {
    readData(file)
      .then(data => {
        sourceFiles[path.basename(file)] = newSourceFile(file, data, true);
        console.log(`found ${file}`);
      }).catch(() => {})
      .then(() => {})
  }
  return sourceFiles[path.basename(file)]
}

if (argv.source) {
  const finder = findit(argv.source)
  finder.on('file', function (file) {
    if (file.substr(-5) === '.json') {
      extractFile(file);
    }
  })
} else {
  const example_path = path.join(process.cwd(), 'src/state/testData.json');
  sourceFiles[undefined] = extractFile(example_path);
}

serve();

function serve() {
  // app.use(express.static('./build'))

  app.use(express.static(path.join(__dirname, './build')))

  if (process.env.NODE_ENV !== 'production') {
    //the dev server is running on an other port
    app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      next()
    })
  }

  if (!argv.development) {
    app.get('/', function (req, res) {
      res.sendFile(path.join(__dirname, './build', 'index.html'))
    })
  }

  app.post('/data', function (req, res) {
    res.json({
      data: sourceFiles[req.param('path')].data,
      path: sourceFiles[req.param('path')].path,
    })
  });

  app.post('/save', function (req, res) {
    const data = req.body;
    if (!data || !data.rasa_nlu_data) {
      res.json({error: 'file is invalid'})
    }
    fs.writeFile(sourceFiles[req.param('path')].path, JSON.stringify(data, null, 2), (error) => {
      if (error) {
        return res.json({error})
      }
      readData(sourceFiles[req.param('path')].path)
        .then(json => sourceFiles[req.param('path')].data = json)
        .catch(error => console.error(error))
        .then(() => res.json({ok: true}))
    })
  });

  if (argv.port) {
    listen(argv.port)
  }
  else {
    getPort().then(port => listen(port))
  }

  function listen(port) {
    app.listen(port)
    if (!argv.development) {
      const url = `http://localhost:${port}/`
      console.log(`server listening at ${url}`)
    }
    else {
      console.log('dev server listening at', port)
    }
  }
}
