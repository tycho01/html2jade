let validJadeIdRegExp = /^[\w\-]+$/;

let validJadeClassRegExp = /^[\w\-]+$/;

export function isValidJadeId(id) {
  id = id ? id.trim() : "";
  return id && validJadeIdRegExp.test(id);
};

export function isValidJadeClassName(className) {
  className = className ? className.trim() : "";
  return className && validJadeClassRegExp.test(className);
};

let Writer = (function() {
  function Writer(options) {
    var ref, ref1, ref2;
    if (options == null) {
      options = {};
    }
    this.wrapLength = (ref = options.wrapLength) != null ? ref : 80;
    this.scalate = (ref1 = options.scalate) != null ? ref1 : false;
    this.attrSep = this.scalate || options.noattrcomma ? ' ' : ', ';
    if (options.double) {
      this.attrQuote = '"';
      this.nonAttrQuote = "'";
    } else {
      this.attrQuote = "'";
      this.nonAttrQuote = '"';
    }
    this.attrQuoteEscaped = "\\" + this.attrQuote;
    this.noEmptyPipe = (ref2 = options.noemptypipe) != null ? ref2 : false;
  }

  Writer.prototype.tagHead = function(node) {
    var result, validClassNames;
    result = node.tagName !== 'DIV' ? node.tagName.toLowerCase() : '';
    if (node.id && isValidJadeId(node.id)) {
      result += "#" + node.id;
    }
    if (node.hasAttribute('class') && node.getAttribute('class').length > 0) {
      validClassNames = node.getAttribute('class').split(/\s+/).filter(function(item) {
        return item && isValidJadeClassName(item);
      });
      result += '.' + validClassNames.join('.');
    }
    if (result.length === 0) {
      result = 'div';
    }
    return result;
  };

  Writer.prototype.tagAttr = function(node, indents) {
    var attr, attrName, attrValue, attrs, invalidClassNames, j, len, result;
    if (indents == null) {
      indents = '';
    }
    attrs = node.attributes;
    if (!attrs || attrs.length === 0) {
      return '';
    } else {
      result = [];
      for (j = 0, len = attrs.length; j < len; j++) {
        attr = attrs[j];
        if (attr && attr.nodeName) {
          attrName = attr.nodeName;
          attrValue = attr.nodeValue;
          if (attrName === 'id' && isValidJadeId(attrValue)) {

          } else if (attrName === 'class') {
            invalidClassNames = node.getAttribute('class').split(/\s+/).filter(function(item) {
              return item && !isValidJadeClassName(item);
            });
            if (invalidClassNames.length > 0) {
              result.push(this.buildTagAttr(attrName, invalidClassNames.join(' ')));
            }
          } else {
            attrValue = attrValue.replace(/(\r|\n)\s*/g, "\\$1" + indents);
            result.push(this.buildTagAttr(attrName, attrValue));
          }
        }
      }
      if (result.length > 0) {
        return "(" + (result.join(this.attrSep)) + ")";
      } else {
        return '';
      }
    }
  };

  Writer.prototype.buildTagAttr = function(attrName, attrValue) {
    if (attrValue.indexOf(this.attrQuote) === -1) {
      return attrName + "=" + this.attrQuote + attrValue + this.attrQuote;
    } else if (attrValue.indexOf(this.nonAttrQuote) === -1) {
      return attrName + "=" + this.nonAttrQuote + attrValue + this.nonAttrQuote;
    } else {
      attrValue = attrValue.replace(new RegExp(this.attrQuote, 'g'), this.attrQuoteEscaped);
      return attrName + "=" + this.attrQuote + attrValue + this.attrQuote;
    }
  };

  Writer.prototype.tagText = function(node) {
    var data, ref;
    if (((ref = node.firstChild) != null ? ref.nodeType : void 0) !== 3) {
      return null;
    } else if (node.firstChild !== node.lastChild) {
      return null;
    } else {
      data = node.firstChild.data;
      if (data.length > this.wrapLength || data.match(/\r|\n/)) {
        return null;
      } else {
        return data;
      }
    }
  };

  Writer.prototype.forEachChild = function(parent, cb) {
    var child, results;
    if (parent) {
      child = parent.firstChild;
      results = [];
      while (child) {
        cb(child);
        results.push(child = child.nextSibling);
      }
      return results;
    }
  };

  Writer.prototype.writeTextContent = function(node, output, options) {
    output.enter();
    this.forEachChild(node, (function(_this) {
      return function(child) {
        return _this.writeText(child, output, options);
      };
    })(this));
    return output.leave();
  };

  Writer.prototype.writeText = function(node, output, options) {
    var data, lines;
    if (node.nodeType === 3) {
      data = node.data || '';
      if (data.length > 0) {
        lines = data.split(/\r|\n/);
        return lines.forEach((function(_this) {
          return function(line) {
            return _this.writeTextLine(node, line, output, options);
          };
        })(this));
      }
    }
  };

  Writer.prototype.writeTextLine = function(node, line, output, options) {
    var encodeEntityRef, escapeBackslash, lines, pipe, prefix, ref, ref1, ref2, ref3, ref4, ref5, ref6, trim, wrap;
    if (options == null) {
      options = {};
    }
    pipe = (ref = options.pipe) != null ? ref : true;
    trim = (ref1 = options.trim) != null ? ref1 : false;
    wrap = (ref2 = options.wrap) != null ? ref2 : true;
    encodeEntityRef = (ref3 = options.encodeEntityRef) != null ? ref3 : false;
    escapeBackslash = (ref4 = options.escapeBackslash) != null ? ref4 : false;
    if (pipe && this.noEmptyPipe && line.trim().length === 0) {
      return;
    }
    prefix = pipe ? '| ' : '';
    if ((node != null ? (ref5 = node.previousSibling) != null ? ref5.nodeType : void 0 : void 0) !== 1) {
      line = line.trimLeft();
    }
    if ((node != null ? (ref6 = node.nextSibling) != null ? ref6.nodeType : void 0 : void 0) !== 1) {
      line = line.trimRight();
    }
    if (line) {
      if (encodeEntityRef) {
        line = Ent.encode(line, entOptions);
      }
      if (escapeBackslash) {
        line = line.replace("\\", "\\\\");
      }
      if (!wrap || line.length <= this.wrapLength) {
        return output.writeln(prefix + line);
      } else {
        lines = this.breakLine(line);
        if (lines.length === 1) {
          return output.writeln(prefix + line);
        } else {
          return lines.forEach((function(_this) {
            return function(line) {
              return _this.writeTextLine(node, line, output, options);
            };
          })(this));
        }
      }
    }
  };

  Writer.prototype.breakLine = function(line) {
    var lines, word, words;
    if (!line || line.length === 0) {
      return [];
    }
    if (line.search(/\s+/ === -1)) {
      return [line];
    }
    lines = [];
    words = line.split(/\s+/);
    line = '';
    while (words.length) {
      word = words.shift();
      if (line.length + word.length > this.wrapLength) {
        lines.push(line);
        line = word;
      } else if (line.length) {
        line += ' ' + word;
      } else {
        line = word;
      }
    }
    if (line.length) {
      lines.push(line);
    }
    return lines;
  };

  return Writer;

})();

export {
  Writer
};