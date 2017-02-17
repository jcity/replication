#!/usr/bin/env node

global._selfGlobal = global;

const { addPath } = require('app-module-path');
const pathExists = require('path-exists');
reqPath(__dirname);

const extraPaths = process.argv.slice(2);
const paths = extraPaths.concat(require(`./paths`));
paths.forEach(path => reqPath(path));

if (extraPaths.length) {
  require('fs').writeFileSync(`${__dirname}/paths.json`, JSON.stringify(paths, null, 2));
}

require('babel-register');
require('./main');

function reqPath(str) {
  str = str.replace(/\/{2}/g, `/`);
  const exists = pathExists.sync(str);
  if (exists) {
    addPath(str);
  } else {
    console.error(`'${str}' doesn't exist`);
    throw new Error();
  }
}
