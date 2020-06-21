import { exec } from "pkg";
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
        await exec([`${this.env.installerDirectory}/package.json`, "-t", "host", "-o", path]);
    }
}
