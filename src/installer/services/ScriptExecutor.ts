import path from "path";
import fs from "fs-extra";
import os from "os";
import vm from "vm";
import { Service } from "typedi";
import { Script } from "../../types/manifest";

/**
 * Script executor.
 *
 * @export
 * @class ScriptExecutor
 */
@Service()
export class ScriptExecutor {
    /**
     * Executes a given post install script.
     *
     * @param {Script} script Script to execute
     * @returns {*}
     * @memberof ScriptExecutor
     */
    public exec(script: Script): any {
        const source = fs.readFileSync(script.path, "utf-8");

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
