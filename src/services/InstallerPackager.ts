import Listr from "listr";
import { exec } from "child_process";
import { Service, Inject } from "typedi";
import { Environment } from "../installer/services/Environment";

/**
 * Installer packager.
 *
 * Packages a custom installer via pkg CLI.
 *
 * @export
 * @class InstallerPackager
 */
@Service()
export class InstallerPackager {
    /**
     * Injected environment.
     *
     * @private
     * @type {Environment}
     * @memberof InstallerPackager
     */
    @Inject()
    private env!: Environment;

    /**
     * Packages the current registered custom installer configuration.
     *
     * @param {string} path Path to output the packaged installer to
     * @returns {Promise<void>}
     * @memberof InstallerPackager
     */
    public async package(path: string): Promise<void> {
        await new Listr([
            {
                title: "Packaging installer",
                task: async () =>
                    new Promise<void>((resolve, reject) => {
                        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
                        exec(`node node_modules/pkg/lib-es5/bin.js ${this.env.installerDirectory}/package.json -t host -o ${path}`, (error) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve();
                            }
                        });
                    }),
            },
        ]).run();
    }
}
