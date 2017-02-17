import * as babel from 'babel-core';
import _ from 'lodash';
import chalk from 'chalk';
import repl from 'repl';

import {
  collectImports,
  deletePaths,
  loadPreviousImports,
  preprocess,
  run,
} from './helpers';

loadPreviousImports()

async function myEval(cmd, context, filename, cb) {
  try {
    await Promise
      .resolve(run(cmd))
      .then(res => {
        collectImports(cmd);
        cb(null, res);
      });
  } catch (e) {
    console.log(chalk.red(e));
    cb();
  }
}

repl.start({ 
  prompt: '> ', 
  eval: myEval,
  ignoreUndefined: true,
  // useGlobal: true,
}).context = global;
