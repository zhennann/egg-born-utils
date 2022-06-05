const path = require('path');
const tools = require('./tools.js');

// cabloyConfig
const cabloyConfig = {
  _fileName: null,
  _config: null,
  async load({ projectPath }) {
    if (!projectPath) projectPath = process.cwd();
    // fileName
    const fileName = path.join(projectPath, 'cabloy.json');
    // config
    let config = await tools.loadJSON(fileName);
    if (!config) {
      config = {
        store: {
          commands: {
            sync: {
              entities: {},
            },
            publish: {
              entities: {},
            },
          },
        },
      };
      await tools.saveJSON(fileName, config);
    }
    // ok
    this._fileName = fileName;
    this._config = config;
    return { fileName, config };
  },
  async save(options) {
    options = options || {};
    const { fileName, config } = options;
    await tools.saveJSON(fileName || this._fileName, config || this._config);
  },
  get() {
    return this._config;
  },
};

module.exports = cabloyConfig;
