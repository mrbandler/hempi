import path from "path";
import fs from "fs-extra";
import os from "os";
import vm from "vm";
import { Service, Inject } from "typedi";
import { Script } from "../../types/manifest";
import { Environment } from "./Environment";

/**
 *
 *
 * @export
 * @class ScriptExecutor
 */
@Service()
export class ScriptExecutor {
    /**
     *
     *
     * @private
     * @type {Environment}
     * @memberof ScriptExecutor
     */
    @Inject()
    private env!: Environment;

    /**
     *
     *
     * @param {Script} script
     * @returns {Promise<void>}
     * @memberof ScriptExecutor
     */
    public async exec(script: Script): Promise<void> {
        const filepath = path.join(this.env.assetsDirectory, script.path);
        const source = fs.readFileSync(filepath, "utf-8");

        vm.runInNewContext(source, this.createVmSandbox());
    }

    /**
     *
     *
     * @private
     * @returns {*}
     * @memberof ScriptExecutor
     */
    private createVmSandbox(): any {
        return {
            require,
            console,
            os,
            path,
            fs,
        };
    }
}
