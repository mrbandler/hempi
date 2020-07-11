import _ from "lodash";
import { exec } from "child_process";
import { Service } from "typedi";
import { Artifact } from "../../types/manifest";

/**
 * Command executer.
 *
 * Executes given artifact commands via the OS shell.
 *
 * @export
 * @class CommandExecutor
 */
@Service()
export class CommandExecutor {
    /**
     * Wildcard constant for the exe file to execute.
     *
     * @private
     * @type {string}
     * @memberof CommandExecutor
     */
    private readonly FILE: string = "{file}";
    private readonly ADD: string = "{add#}";

    /**
     * Executes the commands associated with a given artifact.
     *
     * @param {Artifact} artifact Artifact to execute the command for
     * @returns {Promise<void>}
     * @memberof CommandExecutor
     */
    public async exec(artifact: Artifact): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            exec(this.createCommandArgs(artifact).join(" "), (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Returns the generated command for a given artifact.
     *
     * @param {Artifact} artifact Artifact to generate command for
     * @returns {string} Generated command
     * @memberof CommandExecutor
     */
    public getCommand(artifact: Artifact): string {
        return this.createCommandArgs(artifact).join(" ");
    }

    /**
     * Creates the command basesed on the given artifact.
     *
     * A artifact does not need to have a command property, if it doesn't the command is just the artifact itself.
     *
     * @private
     * @param {Artifact} artifact Artifact to create the command for
     * @returns {(string | undefined)} Created command
     * @memberof CommandExecutor
     */
    private createCommandArgs(artifact: Artifact): string[] {
        let result: string[] = [];

        if (artifact.path) {
            const addMap = new Map<string, string>();
            if (artifact.adds) {
                for (let i = 0; i < artifact.adds.length; i++) {
                    const add = artifact.adds[i];
                    if (add.path) {
                        const key = this.ADD.replace("#", `${i + 1}`);
                        addMap.set(key, add.path);
                    }
                }
            }

            result = artifact.cmd.split(" ").map((a) => {
                let result = a;

                if (a === this.FILE) {
                    result = `"${artifact.path}"`;
                } else if (addMap.has(a)) {
                    result = addMap.get(a) as string;
                } else {
                    const reg = /{(.*)}/.exec(a);
                    if (reg) {
                        const match = _.first(reg);
                        if (match) {
                            result = a.replace(match, addMap.get(match) as string);
                        }
                    }
                }

                return result;
            });
        }

        return result;
    }
}
