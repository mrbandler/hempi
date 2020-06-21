import path from "path";
import fs from "fs-extra";
import os from "os";
import vm from "vm";
import { Service, Inject } from "typedi";
import { Script } from "../../types/manifest";
import { Environment } from "./Environment";

/**
 * Script executor.
 *
 * @export
 * @class ScriptExecutor
 */
@Service()
export class ScriptExecutor {
    /**
     * Injected environment.
     *
     * @private
     * @type {Environment}
     * @memberof ScriptExecutor
     */
    @Inject()
    private env!: Environment;

    /**
     * Executes a given post install script.
     *
     * @param {Script} script Script to execute
     * @returns {*}
     * @memberof ScriptExecutor
     */
    public exec(script: Script): any {
        const filepath = path.join(this.env.assetsDirectory, script.path);
        const source = fs.readFileSync(filepath, "utf-8");

        return vm.runInNewContext(source, this.createSandboxEnv());
    }

    /**
     * Creates the scripts sandbox environment.
     *
     * @private
     * @returns {*}
     * @memberof ScriptExecutor
     */
    private createSandboxEnv(): any {
        return {
            os,
            path,
            fs,
        };
    }
}
