let FS = require("fs");
let jsdom = require("jsdom-little");

export class Parser {
  constructor(options = {}) {
    this.options = options;
    this.jsdom = jsdom;
  }

  parse(arg, cb) {
    if (!arg) {
      return cb('null file');
    } else {
      if (this.options.inputType === "file") {
        arg = FS.readFileSync(arg, "utf8");
      }
      return this.jsdom.env(arg, cb);
    }
  };
}
