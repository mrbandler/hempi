import { Service } from "typedi";
import { INSTALLER_DIRECTORY } from "../env";

/**
 * Environment service.
 *
 * Exposes all environment proprties through a plug and play service.
 *
 * @export
 * @class Environment
 */
@Service()
export class Environment {
    /**
     * CLI bin directory path.
     *
     * @readonly
     * @type {string}
     * @memberof Environment
     */
    public get installerDirectory(): string {
        return INSTALLER_DIRECTORY;
    }

    /**
     * Installer assets directory path.
     *
     * @readonly
     * @type {string}
     * @memberof Environment
     */
    public get assetsDirectory(): string {
        return `${this.installerDirectory}/assets`;
    }

    /**
     * Installer assets scripts directory path.
     *
     * @readonly
     * @type {string}
     * @memberof Environment
     */
    public get assetsScriptsDirectory(): string {
        return `${this.assetsDirectory}/scripts`;
    }

    /**
     * Installer assets artifacts directory path.
     *
     * @readonly
     * @type {string}
     * @memberof Environment
     */
    public get assetsArtifactsDirectory(): string {
        return `${this.assetsDirectory}/artifacts`;
    }

    /**
     *
     *
     * @readonly
     * @type {string}
     * @memberof Environment
     */
    public get assetsManifestPath(): string {
        return `${this.assetsDirectory}/manifest.json`;
    }
}
