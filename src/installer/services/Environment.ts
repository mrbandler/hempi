import os from "os";
import fs from "fs-extra";
import path from "path";
import { Service } from "typedi";
import { env } from "../env";

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
    private disableSSL: boolean = false;

    /**
     * CLI bin directory path.
     *
     * @readonly
     * @type {string}
     * @memberof Environment
     */
    public get installerDirectory(): string {
        return env.INSTALLER_DIRECTORY;
    }

    /**
     * Strict SSL disabled.
     *
     * @readonly
     * @type {boolean}
     * @memberof Environment
     */
    public get disableStrictSSL(): boolean {
        return this.disableSSL;
    }

    /**
     * Set strict SSL disabled.
     *
     * @memberof Environment
     */
    public set disableStrictSSL(value: boolean) {
        this.disableSSL = value;
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
     * Manifest path.
     *
     * @readonly
     * @type {string}
     * @memberof Environment
     */
    public get assetsManifestPath(): string {
        return `${this.assetsDirectory}/manifest.json`;
    }

    /**
     * Temp directory of the host OS.
     *
     * @readonly
     * @type {string}
     * @memberof Environment
     */
    public get osTempDirectory(): string {
        const result = path.join(os.tmpdir(), "hempi");
        if (!fs.existsSync(result)) {
            fs.mkdirsSync(result);
        }

        return result;
    }
}
