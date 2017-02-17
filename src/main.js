import * as babel from 'babel-core';
import _ from 'lodash';
import chalk from 'chalk';
import repl from 'repl';

import {
  collectImports,
  deletePaths,
  isRecoverableError,
  loadPreviousImports,
  preprocess,
  run,
} from './helpers';

async function myEval(cmd, context, filename, cb) {
  let res;
  try {
    res = await run(cmd);
    collectImports(cmd);
  } catch (e) {
    if (isRecoverableError(e)) {
      return cb(new repl.Recoverable(e));
    } else {
      console.error(chalk.red(e.stack));
    }
  }
  cb(null, res);
}

const REPL = repl.start({ 
  prompt: '> ', 
  eval: myEval,
  ignoreUndefined: true,
  replMode: repl.REPL_MODE_MAGIC,
  useGlobal: true,
});

// Skip the stupid '_' assignment warning
REPL.underscoreAssigned = true;
REPL.context._ = require('lodash');

loadPreviousImports();
