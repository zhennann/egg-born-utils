const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const { NodeVM } = require('vm2');
const globby = require('globby');

// tools
const tools = {
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  debounce(func, wait) {
    let i = 0;
    return function (...args) {
      const ctx = this;
      if (i !== 0) clearTimeout(i);
      i = setTimeout(() => {
        func.apply(ctx, args);
      }, wait);
    };
  },
  _adjustLocales(_locales) {
    if (!Array.isArray(_locales)) return _locales;
    // prepare locales
    const locales = {};
    for (const item of _locales) {
      locales[item.value] = item.title;
    }
    return locales;
  },
  preferredLocale({ locale, locales }) {
    // adjustLocales
    locales = this._adjustLocales(locales);
    // locale
    if (!locale) {
      locale = Intl.DateTimeFormat().resolvedOptions().locale;
    }
    locale = locale.toLowerCase().replace(/_/g, '-');
    // match exactly
    if (locales[locale]) return locale;
    // match fuzzy
    const localeShort = locale.split('-')[0];
    return Object.keys(locales).find(item => item.indexOf(localeShort) === 0);
  },
  evaluateExpression({ expression, scope, wrapper }) {
    if (!wrapper) {
      wrapper = 'none';
    } else if (wrapper === true) {
      wrapper = 'commonjs';
    }
    const vm = new NodeVM({
      console: 'inherit',
      sandbox: scope || {},
      require: false,
      nesting: true,
      wrapper,
    });
    let script;
    if (wrapper === 'commonjs') {
      script = expression;
    } else {
      const res = this._checkExpressionWrapperNone({ expression, scope });
      if (res) {
        script = `return (${expression})`;
      } else {
        script = `return (function __inner_function_name(){${expression}})()`;
      }
    }
    return vm.run(script);
  },
  evaluateExpressionSimple({ expression, scope }) {
    const scopeKeys = Object.keys(scope);
    const scopeParams = [];
    for (let i = 0; i < scopeKeys.length; i++) {
      const key = scopeKeys[i];
      scopeParams.push(scope[key]);
    }
    const fn = this._createFunction(expression, scopeKeys);
    return fn.apply(null, scopeParams);
  },
  // function
  _createFunction(expression, scopeKeys) {
    let fn;
    try {
      const js = `return (${expression})`;
      // eslint-disable-next-line
      fn = new Function(scopeKeys.join(','), js);
    } catch (err) {
      // eslint-disable-next-line
      fn = new Function(scopeKeys.join(','), expression);
    }
    return fn;
  },
  _checkExpressionWrapperNone({ expression, scope }) {
    try {
      const scopeKeys = Object.keys(scope);
      const js = `return (${expression})`;
      // eslint-disable-next-line
      new Function(scopeKeys.join(','), js);
      return true;
    } catch (err) {
      return false;
    }
  },
  _getCabloyPath(projectPath) {
    let cabloyPath = path.join(projectPath, 'node_modules/cabloy');
    if (fs.existsSync(cabloyPath)) return cabloyPath;
    cabloyPath = path.join(projectPath, 'packages/cabloy');
    if (fs.existsSync(cabloyPath)) return cabloyPath;
    return null;
  },
  globbySync(patterns, options) {
    if (!Array.isArray(patterns)) patterns = [patterns];
    patterns = patterns.map(item => item.replace(/\\/g, '/'));
    return globby.sync(patterns, options);
  },
  globbyAsync(patterns, options) {
    if (!Array.isArray(patterns)) patterns = [patterns];
    patterns = patterns.map(item => item.replace(/\\/g, '/'));
    return globby(patterns, options);
  },
  async loadJSON(fileName, defaultValue) {
    const exists = await fse.pathExists(fileName);
    if (!exists) {
      return defaultValue || null;
    }
    const content = await fse.readFile(fileName);
    return content ? JSON.parse(content) : defaultValue || null;
  },
  async saveJSON(fileName,value){
    await fse.outputFile(fileName, JSON.stringify(value, null, 2) + '\n');
  }
};

module.exports = tools;
