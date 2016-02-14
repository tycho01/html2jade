'use strict';

var _parser = require('./parser');

var _writer = require('./writer');

var _output = require('./output');

var Converter,
    Ent,
    FS,
    Path,
    StreamOutput,
    StringOutput,
    applyOptions,
    doNotEncode,
    entOptions,
    isNode,
    nspaces,
    publicIdDocTypeNames,
    scope,
    systemIdDocTypeNames,
    useTabs,
    extend = function extend(child, parent) {
  for (var key in parent) {
    if (hasProp.call(parent, key)) child[key] = parent[key];
  }function ctor() {
    this.constructor = child;
  }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
},
    hasProp = {}.hasOwnProperty;

isNode = false;

if (typeof module !== "undefined" && module !== null) {
  isNode = true;
}

scope = typeof exports !== "undefined" && exports !== null ? exports : undefined.Html2Jade != null ? undefined.Html2Jade : undefined.Html2Jade = {};

if (isNode) {
  FS = require("fs");
  Path = require("path");
  Ent = require("he");
} else {
  Ent = he;
  window.Html2Jade = scope;
}

nspaces = 2;

useTabs = false;

doNotEncode = false;

entOptions = {
  useNamedReferences: true
};

publicIdDocTypeNames = {
  "-//W3C//DTD XHTML 1.0 Transitional//EN": "transitional",
  "-//W3C//DTD XHTML 1.0 Strict//EN": "strict",
  "-//W3C//DTD XHTML 1.0 Frameset//EN": "frameset",
  "-//W3C//DTD XHTML 1.1//EN": "1.1",
  "-//W3C//DTD XHTML Basic 1.1//EN": "basic",
  "-//WAPFORUM//DTD XHTML Mobile 1.2//EN": "mobile"
};

systemIdDocTypeNames = {
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd": "transitional",
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd": "strict",
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd": "frameset",
  "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd": "1.1",
  "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd": "basic",
  "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd": "mobile"
};

Converter = function () {
  function Converter(options1) {
    var ref, ref1;
    this.options = options1 != null ? options1 : {};
    this.scalate = (ref = this.options.scalate) != null ? ref : false;
    this.writer = (ref1 = this.options.writer) != null ? ref1 : new _writer.Writer(this.options);
  }

  Converter.prototype.document = function (document, output) {
    var docTypeName, doctype, htmlEls, publicId, systemId;
    if (document.doctype != null) {
      doctype = document.doctype;
      docTypeName = void 0;
      publicId = doctype.publicId;
      systemId = doctype.systemId;
      if (publicId != null && publicIdDocTypeNames[publicId] != null) {
        docTypeName = publicIdDocTypeNames[publicId];
      } else if (systemId != null && systemIdDocTypeNames[systemId] != null) {
        docTypeName = systemIdDocTypeNames[systemId] != null;
      } else if (doctype.name != null && doctype.name.toLowerCase() === 'html') {
        docTypeName = 'html';
      }
      if (docTypeName != null) {
        output.writeln('doctype ' + docTypeName);
      }
    }
    if (document.documentElement) {
      return this.children(document, output, false);
    } else {
      htmlEls = document.getElementsByTagName('html');
      if (htmlEls.length > 0) {
        return this.element(htmlEls[0], output);
      }
    }
  };

  Converter.prototype.element = function (node, output) {
    var firstline, tagAttr, tagHead, tagName, tagText;
    if (!(node != null ? node.tagName : void 0)) {
      return;
    }
    tagName = node.tagName.toLowerCase();
    tagHead = this.writer.tagHead(node);
    tagAttr = this.writer.tagAttr(node, output.indents);
    tagText = this.writer.tagText(node);
    if (tagName === 'script' || tagName === 'style') {
      if (node.hasAttribute('src')) {
        output.writeln(tagHead + tagAttr);
        return this.writer.writeTextContent(node, output, {
          pipe: false,
          wrap: false
        });
      } else if (tagName === 'script') {
        return this.script(node, output, tagHead, tagAttr);
      } else if (tagName === 'style') {
        return this.style(node, output, tagHead, tagAttr);
      }
    } else if (tagName === 'conditional') {
      output.writeln('//' + node.getAttribute('condition'));
      return this.children(node, output);
    } else if (['pre'].indexOf(tagName) !== -1) {
      output.writeln(tagHead + tagAttr + '.');
      output.enter();
      firstline = true;
      this.writer.forEachChild(node, function (_this) {
        return function (child) {
          var data;
          if (child.nodeType === 3) {
            data = child.data;
            if (data != null && data.length > 0) {
              if (firstline) {
                if (data.search(/\r\n|\r|\n/) === 0) {
                  data = data.replace(/\r\n|\r|\n/, '');
                }
                data = '\\n' + data;
                firstline = false;
              }
              data = data.replace(/\t/g, '\\t');
              data = data.replace(/\r\n|\r|\n/g, '\n' + output.indents);
              return output.write(data);
            }
          }
        };
      }(this));
      output.writeln();
      return output.leave();
    } else if (this.options.bodyless && (tagName === 'html' || tagName === 'body')) {
      return this.children(node, output, false);
    } else if (tagText) {
      if (doNotEncode) {
        return output.writeln(tagHead + tagAttr + ' ' + tagText);
      } else {
        return output.writeln(tagHead + tagAttr + ' ' + Ent.encode(tagText, entOptions));
      }
    } else {
      output.writeln(tagHead + tagAttr);
      return this.children(node, output);
    }
  };

  Converter.prototype.children = function (parent, output, indent) {
    if (indent == null) {
      indent = true;
    }
    if (indent) {
      output.enter();
    }
    this.writer.forEachChild(parent, function (_this) {
      return function (child) {
        var nodeType;
        nodeType = child.nodeType;
        if (nodeType === 1) {
          return _this.element(child, output);
        } else if (nodeType === 3) {
          if (parent._nodeName === 'code') {
            return _this.text(child, output, {
              encodeEntityRef: true,
              pipe: true
            });
          } else {
            return _this.text(child, output, doNotEncode ? {
              encodeEntityRef: false
            } : {
              encodeEntityRef: true
            });
          }
        } else if (nodeType === 8) {
          return _this.comment(child, output);
        }
      };
    }(this));
    if (indent) {
      return output.leave();
    }
  };

  Converter.prototype.text = function (node, output, options) {
    node.normalize();
    return this.writer.writeText(node, output, options);
  };

  Converter.prototype.comment = function (node, output) {
    var condition, data, lines;
    condition = node.data.match(/\s*\[(if\s+[^\]]+)\]/);
    if (!condition) {
      data = node.data || '';
      if (data.length === 0 || data.search(/\r|\n/) === -1) {
        return output.writeln("// " + data.trim());
      } else {
        output.writeln('//');
        output.enter();
        lines = data.split(/\r|\n/);
        lines.forEach(function (_this) {
          return function (line) {
            return _this.writer.writeTextLine(node, line, output, {
              pipe: false,
              trim: true,
              wrap: false
            });
          };
        }(this));
        return output.leave();
      }
    } else {
      return this.conditional(node, condition[1], output);
    }
  };

  Converter.prototype.conditional = function (node, condition, output) {
    var conditionalElem, innerHTML;
    innerHTML = node.textContent.trim().replace(/\s*\[if\s+[^\]]+\]>\s*/, '').replace('<![endif]', '');
    if (innerHTML.indexOf("<!") === 0) {
      condition = " [" + condition + "] <!";
      innerHTML = null;
    }
    conditionalElem = node.ownerDocument.createElement('conditional');
    conditionalElem.setAttribute('condition', condition);
    if (innerHTML) {
      conditionalElem.innerHTML = innerHTML;
    }
    return node.parentNode.insertBefore(conditionalElem, node.nextSibling);
  };

  Converter.prototype.script = function (node, output, tagHead, tagAttr) {
    if (this.scalate) {
      output.writeln(':javascript');
      return this.writer.writeTextContent(node, output, {
        pipe: false,
        wrap: false
      });
    } else {
      output.writeln("" + tagHead + tagAttr + ".");
      return this.writer.writeTextContent(node, output, {
        pipe: false,
        trim: true,
        wrap: false,
        escapeBackslash: true
      });
    }
  };

  Converter.prototype.style = function (node, output, tagHead, tagAttr) {
    if (this.scalate) {
      output.writeln(':css');
      return this.writer.writeTextContent(node, output, {
        pipe: false,
        wrap: false
      });
    } else {
      output.writeln("" + tagHead + tagAttr + ".");
      return this.writer.writeTextContent(node, output, {
        pipe: false,
        trim: true,
        wrap: false
      });
    }
  };

  return Converter;
}();

StringOutput = function (superClass) {
  extend(StringOutput, superClass);

  function StringOutput() {
    StringOutput.__super__.constructor.apply(this, arguments);
    this.fragments = [];
  }

  StringOutput.prototype.write = function (data, indent) {
    if (indent == null) {
      indent = true;
    }
    if (data == null) {
      data = '';
    }
    if (indent) {
      return this.fragments.push(this.indents + data);
    } else {
      return this.fragments.push(data);
    }
  };

  StringOutput.prototype.writeln = function (data, indent) {
    if (indent == null) {
      indent = true;
    }
    if (data == null) {
      data = '';
    }
    if (indent) {
      return this.fragments.push(this.indents + data + '\n');
    } else {
      return this.fragments.push(data + '\n');
    }
  };

  StringOutput.prototype.final = function () {
    var result;
    result = this.fragments.join('');
    this.fragments = [];
    return result;
  };

  return StringOutput;
}(_output.Output);

StreamOutput = function (superClass) {
  extend(StreamOutput, superClass);

  function StreamOutput(stream) {
    this.stream = stream;
    StreamOutput.__super__.constructor.apply(this, arguments);
  }

  StreamOutput.prototype.write = function (data, indent) {
    if (indent == null) {
      indent = true;
    }
    if (data == null) {
      data = '';
    }
    if (indent) {
      return this.stream.write(this.indents + data);
    } else {
      return this.stream.write(data);
    }
  };

  StreamOutput.prototype.writeln = function (data, indent) {
    if (indent == null) {
      indent = true;
    }
    if (data == null) {
      data = '';
    }
    if (indent) {
      return this.stream.write(this.indents + data + '\n');
    } else {
      return this.stream.write(data + '\n');
    }
  };

  return StreamOutput;
}(_output.Output);

scope.Output = _output.Output;

scope.StringOutput = StringOutput;

scope.Converter = Converter;

scope.Writer = _writer.Writer;

applyOptions = function applyOptions(options) {
  entOptions.useNamedReferences = !options.numeric;
  if (options.nspaces) {
    nspaces = options.nspaces;
  }
  if (options.tabs) {
    useTabs = true;
  }
  if (options.donotencode) {
    return doNotEncode = true;
  }
};

if (typeof exports !== "undefined" && exports !== null) {
  scope.Parser = _parser.Parser;
  scope.StreamOutput = StreamOutput;
  scope.convert = function (input, output, options) {
    if (options == null) {
      options = {};
    }
    applyOptions(options);
    if (options.parser == null) {
      options.parser = new _parser.Parser(options);
    }
    return options.parser.parse(input, function (errors, window) {
      if (errors != null ? errors.length : void 0) {
        return errors;
      } else {
        if (output == null) {
          output = new StreamOutput(process.stdout);
        }
        if (options.converter == null) {
          options.converter = new Converter(options);
        }
        return options.converter.document(window.document, output);
      }
    });
  };
}

scope.convertHtml = function (html, options, cb) {
  if (options == null) {
    options = {};
  }
  applyOptions(options);
  if (options.parser == null) {
    options.parser = new _parser.Parser(options);
  }
  return options.parser.parse(html, function (errors, window) {
    var output, ref;
    if (errors != null ? errors.length : void 0) {
      return errors;
    } else {
      output = (ref = options.output) != null ? ref : new StringOutput();
      if (options.converter == null) {
        options.converter = new Converter(options);
      }
      options.converter.document(window.document, output);
      if (cb != null) {
        return cb(null, output.final());
      }
    }
  });
};

scope.convertDocument = function (document, options, cb) {
  var output, ref;
  if (options == null) {
    options = {};
  }
  applyOptions(options);
  output = (ref = options.output) != null ? ref : new StringOutput();
  if (options.converter == null) {
    options.converter = new Converter(options);
  }
  options.converter.document(document, output);
  if (cb != null) {
    return cb(null, output.final());
  }
};