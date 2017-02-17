# REPLication

> An ESNext REPL to support your app

## Install

```
$ npm install --save replication
```

## Usage

```shell
$ repl [path ...]
```

 You can start the REPL with `repl`. If you want any of your app's local folders
 to be added to `require`'s list of module resolution paths, you can include the
 paths as arguments to `repl`. This only needs to be done once and will be
 persisted after that (if you reinstall your node modules, that **will**
 overwrite these settings).

 `repl` remembers all your `import` and `require` statements and
 automatically imports them every time you start the REPL. `repl` also
 watches the files you import for any changes and hot reloads them when the
 underlying files change.

## License

MIT © [Vince Coppola](http://github.com/vincecoppola)
