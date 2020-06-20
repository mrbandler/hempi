import fs from "fs-extra";
import { exec } from "pkg";
import { Service } from "typedi";

/**
 * Installer packager.
 *
 * Packages a custom installer.
 *
 * @export
 * @class InstallerPackager
 */
@Service()
export class InstallerPackager {
    /**
     * Packages the current custom installer configuration.
     *
     * @param {string} path Path to output the packaged installer to
     * @returns {Promise<void>}
     * @memberof InstallerPackager
     */
    public async package(path: string): Promise<void> {
        if (fs.pathExistsSync(path)) {
            await exec([`${__dirname}/installer`, "-o", path]);
        }
    }
}
