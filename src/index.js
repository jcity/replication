#!/usr/bin/env node

import 'babel-register';

global._selfGlobal = global;

const appRoot = require('app-root-path');
const fs = require('fs');
const pathExists = require('path-exists');
const { addPath } = require('app-module-path');

reqPath(__dirname);
fs.writeFileSync(`${__dirname}/history.js`, `\n`, { flag: `a` });
if (!pathExists.sync(`${__dirname}/paths.json`)) {
  let { REPL_PATHS } = process.env;
  if (!REPL_PATHS) {
    REPL_PATHS = [`${appRoot}/app`, `${appRoot}/dist`];
  }
  fs.writeFileSync(`${__dirname}/paths.json`, JSON.stringify(REPL_PATHS, null, 2));
}

const extraPaths = process.argv.slice(2);
const paths = [ ...new Set(extraPaths.concat(require(`./paths`))) ];
paths.forEach(path => reqPath(path));

if (extraPaths.length) {
  fs.writeFileSync(`${__dirname}/paths.json`, JSON.stringify(paths, null, 2));
}

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
