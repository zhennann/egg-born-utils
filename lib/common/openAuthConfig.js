const os = require('os');
const path = require('path');
const tools = require('./tools.js');

// openAuthConfig
const openAuthConfig = {
  _fileName: null,
  async load() {
    // fileName
    const fileName = path.join(os.homedir(), '.cabloy', 'openauth.json');
    // config
    const config = await tools.loadJSON(fileName, {});
    // ok
    this._fileName = fileName;
    return { fileName, config };
  },
  async save({ fileName, config }) {
    await tools.saveJSON(fileName || this._fileName,config);
  },
  async prepareToken(projectPath, tokenName) {
    if (!projectPath) projectPath = process.cwd();
    // tokenName
    tokenName = this.prepareTokenName(projectPath, tokenName);
    // init file
    const { config } = await this.load();
    return config.tokens && config.tokens[tokenName];
  },
  prepareTokenName(projectPath, tokenName) {
    if (tokenName) return tokenName;
    const pkg = require(path.join(projectPath, 'package.json'));
    return `clidev@${pkg.name}`;
  },
};

module.exports = openAuthConfig;
