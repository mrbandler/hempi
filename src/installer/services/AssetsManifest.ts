import fs from "fs-extra";
import { Service } from "typedi";
import { Artifact, AssetsManifest, Script, Arch } from "../../types/manifest";

/**
 *
 *
 * @export
 * @class AssetsManifest
 */
@Service()
export class AssetsManifestManager {
    /**
     *
     *
     * @private
     * @type {AssetsManifest}
     * @memberof AssetsManifestManager
     */
    private manifest: AssetsManifest = { artifacts: [], scripts: [] };

    /**
     *
     *
     * @param {string} path
     * @memberof AssetsManifest
     */
    public load(path: string): void {
        if (fs.existsSync(path)) {
            this.manifest = fs.readJSONSync(path) as AssetsManifest;
        } else {
            throw new Error("Installer manifest could not be loaded");
        }
    }

    /**
     *
     *
     * @param {string} path
     * @memberof AssetsManifest
     */
    public save(path: string): void {
        if (fs.pathExistsSync(path)) {
            fs.writeJSONSync(path, this.manifest);
        } else {
            throw new Error("Unable to save manifest, assets registry not initilized");
        }
    }

    /**
     *
     *
     * @param {Artifact} artifact
     * @memberof AssetsManifestManager
     */
    public addArtifact(artifact: Artifact): void {
        this.manifest.artifacts.push(artifact);
    }

    /**
     *
     *
     * @param {Script} script
     * @memberof AssetsManifestManager
     */
    public addScripts(script: Script): void {
        this.manifest.scripts.push(script);
    }

    /**
     *
     *
     * @param {string} pkg
     * @param {Arch} arch
     * @returns {(Artifact | undefined)}
     * @memberof AssetsManifestManager
     */
    public getArtifact(pkg: string, arch: Arch): Artifact | undefined {
        let result: Artifact | undefined = undefined;

        if (this.manifest) {
            result = this.manifest.artifacts.find((a) => a.package === pkg && a.arch === arch);
        }

        return result;
    }

    /**
     *
     *
     * @param {string} pkg
     * @returns {(Script | undefined)}
     * @memberof AssetsManifestManager
     */
    public getScript(pkg: string): Script | undefined {
        let result: Script | undefined = undefined;

        if (this.manifest) {
            result = this.manifest.scripts.find((s) => s.package === pkg);
        }

        return result;
    }
}
