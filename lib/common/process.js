const { spawn } = require('child_process');
const path = require('path');

const _process = {
    async spawnBin({ cmd, args, options }) {
        cmd = path.join(options.cwd, 'node_modules/.bin', cmd);
        return await this.spawnCmd({ cmd, args, options });
    },
    async spawnCmd({ cmd, args, options }) {
        if (/^win/.test(process.platform)) {
            cmd = `${cmd}.cmd`;
        }
        return await this.spawn({ cmd, args, options });
    },
    async spawnExe({ cmd, args, options }) {
        if (/^win/.test(process.platform)) {
            cmd = `${cmd}.exe`;
        }
        return await this.spawn({ cmd, args, options });
    },
    async spawn({ cmd, args = [], options = {} }) {
        const methodLog = options.methodLog;
        const methodError = options.methodError;
        return new Promise((resolve, reject) => {
            const logPrefix = options.logPrefix;
            const proc = spawn(cmd, args, options);
            let stdout = '';
            // let stderr = '';
            proc.stdout.on('data', data => {
                stdout += data.toString();
                if (methodLog) {
                    methodLog(data);
                } else {
                    console.log(data.toString())
                }
            });
            proc.stderr.on('data', data => {
                // stderr += data.toString();
                if (methodLog) {
                    methodLog(data);
                } else {
                    console.log(data.toString())
                }
            });
            proc.once('exit', code => {
                if (code !== 0) {
                    let err = new Error(`spawn ${cmd} ${args.join(' ')} fail, exit code: ${code}`);
                    if (methodError) {
                        err = methodError(code);
                    } else {
                        err.code = code;
                    }
                    return reject(err);
                }
                resolve(stdout);
            });
        });
    }
}

module.exports = _process;
