/// <reference path='./ramda.d.ts' />

let R = require('ramda');

let enquote = (quote: string) => (str: string) => quote + str + quote;
let safeQuote = (str: string) => R.find(qt => !str.includes(qt));
let tryQuote = (quotes: string[]) => (str: string) => {
  let qt: string = safeQuote(str)(quotes);
  if(qt) {
    return enquote(qt)(str);
  } else {
    let qt = quotes[0];
    return enquote(qt)(str.replace(qt, '\\' + qt));
  }
}
let children = (el: HTMLElement) => Array.from(el.childNodes);
let pad = (s: string) => '  ' + s;
function nodesFrom(html: string): Array<Node> {
  let div = document.createElement('div');
  div.innerHTML = html;
  return children(div);
}
function node(n: Node): string[] {
  return n.nodeType == Node.TEXT_NODE ? textNode(n) : element(n);
}
function textNode(n: Text): string[] {
  return ['| ' + n.wholeText];
}
function element(el: HTMLElement): string[] {
  let name = el.localName;
  let attrs = el.attributes;
  let attrR = Array.from(attrs);
  let attrRest = attrR.filter(a => !['id','class'].includes(a.name));
  let id = el.id ? '#' + el.id : '';
  let classes = attrs.getNamedItem('class').value.split(' ').map(s => '.' + s).join('');
  let tag = name + id + classes;
  var box = attrRest.length ? [tag + '('].concat(attrRest.map(attribute).map(pad), [')']) : [tag];
  let content: string[] = R.chain(node)(children(el)).map(pad);
  return [...box, ...content];
}
let isBinding = (str) => /[()[\]]/.test(str);
let restoreCase = (str) => /^[\[*]ng\w/.test(str) ? R.adjust(s => s.toUpperCase(), 3, str).join('') : str;
function attribute(attr) {
  let { name, value } = attr;
  name = restoreCase(name);
  let isComplex = isBinding(name);
  return attrK(name, isComplex) + (value ? '=' + attrV(value, isComplex) : '');
}
const QUOTES = ["'",'"','`'];
let attrK: (string, boolean) => string = (str, isComplex) => isComplex ? tryQuote(QUOTES)(str) : str;
let attrV: (string, boolean) => string = (str, isComplex) => isComplex || /{{.*}}/.test(str) ? tryQuote(['`',"'",'"'])(str) : tryQuote(QUOTES)(str);
export let toJade: (string) => string = (html) => R.flatten(nodesFrom(html).map(node)).join('\n') + '\n';
