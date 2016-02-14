"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FS = require("fs");
var jsdom = require("jsdom-little");

var Parser = exports.Parser = function () {
  function Parser() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Parser);

    this.options = options;
    this.jsdom = jsdom;
  }

  _createClass(Parser, [{
    key: "parse",
    value: function parse(arg, cb) {
      if (!arg) {
        return cb('null file');
      } else {
        if (this.options.inputType === "file") {
          arg = FS.readFileSync(arg, "utf8");
        }
        return this.jsdom.env(arg, cb);
      }
    }
  }]);

  return Parser;
}();