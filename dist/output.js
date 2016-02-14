'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var nspaces = 2;
var useTabs = false;

var Output = function () {
  function Output() {
    this.indents = '';
  }

  Output.prototype.enter = function () {
    var i, j, ref, results;
    if (useTabs) {
      return this.indents += '\t';
    } else {
      results = [];
      for (i = j = 1, ref = nspaces; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        results.push(this.indents += ' ');
      }
      return results;
    }
  };

  Output.prototype.leave = function () {
    if (useTabs) {
      return this.indents = this.indents.substring(1);
    } else {
      return this.indents = this.indents.substring(nspaces);
    }
  };

  Output.prototype.write = function (data, indent) {
    if (indent == null) {
      indent = true;
    }
  };

  Output.prototype.writeln = function (data, indent) {
    if (indent == null) {
      indent = true;
    }
  };

  return Output;
}();

exports.Output = Output;