const path = require('path');
const fse = require('fs-extra');

// cabloyConfig
const cabloyConfig = {
  _fileName: null,
  _config: null,
  async load({ projectPath }) {
    if (!projectPath) projectPath = process.cwd();
    // fileName
    const fileName = path.join(projectPath, 'cabloy.json');
    // config
    let config;
    const exists = await fse.pathExists(fileName);
    if (!exists) {
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
      await fse.outputFile(fileName, JSON.stringify(config, null, 2));
    } else {
      const content = await fse.readFile(fileName);
      config = JSON.parse(content);
    }
    // ok
    this._fileName = fileName;
    this._config = config;
    return { fileName, config };
  },
  async save(options) {
    options = options || {};
    const { fileName, config } = options;
    await fse.outputFile(fileName || this._fileName, JSON.stringify(config || this._config, null, 2));
  },
  get() {
    return this._config;
  }
};

module.exports = cabloyConfig;
