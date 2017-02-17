import * as babel from 'babel-core';
import _ from 'lodash';
import fs from 'fs';
import which from 'which-module';

global.beforeKeys = _.keys(global);

const pipeline = new babel.Pipeline;

setInterval(getModulesToRefresh, 3000);

export function run(code) {
  return eval(transpile(code));
}

export function getModulesToRefresh() {
  const keys = _.pullAll(_.keys(global), global.beforeKeys);
  const mods = _.compact(_.map(keys, key => {
    const path = _.get(which(global[key]), `id`);
    return path ? { key, path } : null;
  }));
  global.beforeKeys = _.uniq([...global.beforeKeys, ...keys]);
  _.map(mods, mod => watcher(mod));
}

export function watcher({ key, path }) {
  fs.watch(path, event => {
    if (event === `change`) {
      console.log('changed!');
      deletePaths(path);
    }
  });
}

export function collectImports(code) {
  const importRe = new RegExp(/(^import\s.*|require\()/gm);
  const lines = code.split(`\n`);
  _.forEach(lines, line => {
    if (importRe.test(line)) {
      fs.writeFileSync(`${__dirname}/history.js`, `\n${line}\n`, { flag: `a` });
    }
  });
}

export function deletePaths(path) {
  const stopId = module.id;
  const mod = require.cache[path];
  if (!mod || !mod.parent) return;
  const paths = [];
  re(mod);
  _.forEach(paths, p => {
    delete require.cache[p];
  });
  loadPreviousImports();
  function re(obj) {
    paths.push(obj.id);
    if (obj.parent.id !== stopId) {
      re(obj.parent);
    }
  }
}

export function loadPreviousImports() {
  const indexRe = new RegExp(/\/index\.js/);
  const historicImports = _.uniq(_.compact(fs.readFileSync(`${__dirname}/history.js`, `utf-8`).split(`\n`)));
  _.forEach(historicImports, i => {
    try { 
      const before = _.keys(require.cache);
      eval(transpile(i));
      let path = _.head(_.compact(_.pullAll(_.keys(require.cache), before)));
      if (path) {
        if (indexRe.test(path)) {
          let newPath = path.replace(indexRe, '');
          fs.watch(newPath, (event, name) => {
            const path = `${newPath}/${name}`;
            deletePaths(path);
          });
        } else {
          fs.watch(path, event => {
            deletePaths(path);
          });
        }
      }
    }
    catch (e) { _.pull(historicImports, i) }
  });
  fs.writeFileSync(`${__dirname}/history.js`, _.orderBy(historicImports).join(`\n`));
}

export function preprocess(input) {
  const awaitMatcher = /^(?:\s*(?:(?:let|var|const)\s)?\s*([^=]+)=\s*|^\s*)(await\s[\s\S]*)/;
  const asyncWrapper = (code, binder) => {
    let assign = binder ? `global.${binder} = ` : '';
    return `(function(){ async function _wrap() { return ${assign}${code} } return _wrap();})()`;
  };

  const match = input.match(awaitMatcher);
  if (match) {
    input = `${asyncWrapper(match[2], match[1])}`;
  }
  return input;
}

export function transpile(cmd) {
  return pipeline.pretransform(preprocess(cmd), {
    presets: [ 'stage-0', 'es2015' ],
    plugins: [
      'transform-assign-top-level-to-global',
      'transform-decorators-legacy',
      'transform-async-to-generator',
      'transform-object-rest-spread',
      'transform-export-extensions',
      ['transform-runtime', { regenerator: true }],
    ]
  }).transform().code;
}
