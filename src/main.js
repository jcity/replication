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
  let res;
  try {
    res = await run(cmd);
    collectImports(cmd);
  } catch (e) {
    try {
      repl.repl._tabComplete();
    } catch(e) {
      console.log(chalk.red(e));
      return cb(new repl.Recoverable(e));
    }
  }
  cb(null, res);
}

repl.start({ 
  prompt: '> ', 
  eval: myEval,
  ignoreUndefined: true,
  useGlobal: true,
}).context = global;
