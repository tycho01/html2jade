"use strict";
var R = require('ramda');
var enquote = function (quote) { return function (str) { return quote + str + quote; }; };
var safeQuote = function (str) { return R.find(function (qt) { return !str.includes(qt); }); };
var tryQuote = function (quotes) { return function (str) {
    var qt = safeQuote(str)(quotes);
    if (qt) {
        return enquote(qt)(str);
    }
    else {
        var qt_1 = quotes[0];
        return enquote(qt_1)(str.replace(qt_1, '\\' + qt_1));
    }
}; };
var children = function (el) { return Array.from(el.childNodes); };
var pad = function (s) { return '  ' + s; };
function nodesFrom(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return children(div);
}
function node(n) {
    return n.nodeType == Node.TEXT_NODE ? textNode(n) : element(n);
}
function textNode(n) {
    return ['| ' + n.wholeText];
}
function element(el) {
    var name = el.localName;
    var attrs = el.attributes;
    var attrR = Array.from(attrs);
    var attrRest = attrR.filter(function (a) { return !['id', 'class'].includes(a.name); });
    var id = el.id ? '#' + el.id : '';
    var classes = attrs.getNamedItem('class').value.split(' ').map(function (s) { return '.' + s; }).join('');
    var tag = name + id + classes;
    var box = attrRest.length ? [tag + '('].concat(attrRest.map(attribute).map(pad), [')']) : [tag];
    var content = R.chain(node)(children(el)).map(pad);
    return box.concat(content);
}
var isBinding = function (str) { return /[()[\]]/.test(str); };
var restoreCase = function (str) { return /^[\[*]ng\w/.test(str) ? R.adjust(function (s) { return s.toUpperCase(); }, 3, str).join('') : str; };
function attribute(attr) {
    var name = attr.name, value = attr.value;
    name = restoreCase(name);
    var isComplex = isBinding(name);
    return attrK(name, isComplex) + (value ? '=' + attrV(value, isComplex) : '');
}
var QUOTES = ["'", '"', '`'];
var attrK = function (str, isComplex) { return isComplex ? tryQuote(QUOTES)(str) : str; };
var attrV = function (str, isComplex) { return isComplex || /{{.*}}/.test(str) ? tryQuote(['`', "'", '"'])(str) : tryQuote(QUOTES)(str); };
exports.toJade = function (html) { return R.flatten(nodesFrom(html).map(node)).join('\n') + '\n'; };
