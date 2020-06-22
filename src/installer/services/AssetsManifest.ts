import fs from "fs-extra";
import path from "path";
import os from "os";
import { Service, Inject } from "typedi";
import { Artifact, AssetsManifest, Script, Arch } from "../../types/manifest";
import { Environment } from "./Environment";

/**
 * Asset manifest manager.
 *
 * Manages all asset entries within the manifest.
 *
 * @export
 * @class AssetsManifest
 */
@Service()
export class AssetManifestManager {
    /**
     * Injectede environment.
     *
     * @private
     * @type {Environment}
     * @memberof AssetManifestManager
     */
    @Inject()
    private env!: Environment;

    /**
     * Internal manifest object.
     *
     * @private
     * @type {AssetsManifest}
     * @memberof AssetManifestManager
     */
    private manifest: AssetsManifest = { artifacts: [], scripts: [], disableStrictSSL: false };

    /**
     * Loads a manifest from disk given a filepath.
     *
     * @param {string} filepath Filepath of the manifest
     * @memberof AssetsManifest
     */
    public load(filepath: string): void {
        if (fs.existsSync(path.dirname(filepath))) {
            this.manifest = fs.readJSONSync(filepath) as AssetsManifest;
            this.env.disableStrictSSL = this.manifest.disableStrictSSL;

            // Normalize paths.
            this.manifest.artifacts = this.manifest.artifacts.map((a) => {
                if (a.path) {
                    a.path = path.join(this.env.assetsDirectory, a.path);
                }

                return a;
            });

            this.manifest.scripts = this.manifest.scripts.map((s) => {
                s.path = path.join(this.env.assetsDirectory, s.path);

                return s;
            });
        } else {
            throw new Error("Installer manifest could not be loaded");
        }
    }

    /**
     * Save the current manifest to disk
     *
     * @param {string} filepath Filepath of the file to save to
     * @memberof AssetsManifest
     */
    public save(filepath: string): void {
        if (fs.pathExistsSync(path.dirname(filepath))) {
            this.manifest.disableStrictSSL = this.env.disableStrictSSL;
            fs.writeJSONSync(filepath, this.manifest);
        } else {
            throw new Error("Unable to save manifest, assets registry not initilized");
        }
    }

    /**
     * Returns all artifacts relevant for the executing OS architecture
     *
     * @returns {Artifact[]} All relevant artifacts
     * @memberof AssetManifestManager
     */
    public getArtifacts(): Artifact[] {
        let result: Artifact[] = [];

        if (os.arch() === Arch.x64) {
            result = this.manifest.artifacts
                .filter((a) => a.arch === Arch.x32)
                .map((a) => {
                    const x64 = this.manifest.artifacts.find((art) => art.arch === Arch.x64 && art.package === a.package);
                    return x64 ? x64 : a;
                });
        } else {
            result = this.manifest.artifacts.filter((a) => a.arch === Arch.x32);
        }

        return result;
    }

    /**
     * Returns a post install script given a package name.
     *
     * @param {string} pkg Package name
     * @returns {(Script | undefined)}
     * @memberof AssetManifestManager
     */
    public getScript(pkg: string): Script | undefined {
        return this.manifest.scripts.find((s) => s.package === pkg);
    }

    /**
     * Adds a given artifact to the manifest.
     *
     * @param {Artifact} artifact Artifact to add
     * @memberof AssetManifestManager
     */
    public addArtifact(artifact: Artifact): void {
        this.manifest.artifacts.push(artifact);
    }

    /**
     * Adds a post install script to the manifest.
     *
     * @param {Script} script Script to add
     * @memberof AssetManifestManager
     */
    public addScripts(script: Script): void {
        this.manifest.scripts.push(script);
    }
}
