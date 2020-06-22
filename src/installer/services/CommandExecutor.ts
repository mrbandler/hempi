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
    private readonly EXE: string = "{exe}";

    /**
     * Executes the commands associated with a given artifact.
     *
     * @param {Artifact} artifact Artifact to execute the command for
     * @returns {Promise<void>}
     * @memberof CommandExecutor
     */
    public async exec(artifact: Artifact): Promise<void> {
        const command = this.createCommand(artifact);
        if (command) {
            console.log(command);
            return new Promise<void>((resolve, reject) => {
                exec(command, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        }
    }

    /**
     * Returns the generated command for a given artifact.
     *
     * @param {Artifact} artifact Artifact to generate command for
     * @returns {string} Generated command
     * @memberof CommandExecutor
     */
    public getCommand(artifact: Artifact): string {
        let result = this.createCommand(artifact);
        if (!result) {
            result = artifact.cmd ? artifact.cmd : artifact.path ? artifact.path : "";
        }

        return result;
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
    private createCommand(artifact: Artifact): string | undefined {
        let result: string | undefined = undefined;

        if (artifact.path) {
            result = artifact.cmd ? artifact.cmd.replace(this.EXE, artifact.path) : artifact.path;
        }

        return result;
    }
}
