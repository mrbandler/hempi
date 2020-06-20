import fs from "fs-extra";
import path from "path";
import { Service, Inject } from "typedi";
import { Environment } from "../installer/services/Environment";
import { Artifact, Script } from "../types/manifest";
import { AssetsManifestManager } from "../installer/services/AssetsManifest";

@Service()
export class AssetsRegistry {
    /**
     *
     *
     * @private
     * @type {Environment}
     * @memberof InstallerConfigurator
     */
    @Inject()
    private env!: Environment;

    /**
     *
     *
     * @private
     * @type {AssetsManifestManager}
     * @memberof AssetsRegistry
     */
    @Inject()
    private manifest!: AssetsManifestManager;

    /**
     *
     *
     * @memberof AssetsRegistry
     */
    public initAssetsDirectory(): void {
        if (fs.pathExistsSync(this.env.assetsDirectory) === false) {
            this.createAssetsDirectory();
        } else {
            this.clearAssetsDirectory();
            this.createAssetsDirectory();
        }
    }

    /**
     *
     *
     * @memberof AssetsRegistry
     */
    public clearAssetsDirectory(): void {
        fs.rmdirSync(this.env.assetsDirectory, {
            recursive: true,
        });
    }

    /**
     *
     *
     * @memberof AssetsRegistry
     */
    public saveManifest(): void {
        this.manifest.save(this.env.assetsManifestPath);
    }

    /**
     *
     *
     * @param {Artifact} artifact
     * @returns {Promise<void>}
     * @memberof AssetsRegistry
     */
    public async addArtifact(artifact: Artifact, download?: boolean): Promise<void> {
        if (download) {
            // TODO: Download artifact here and add path to the artifact object.
        }

        this.manifest.addArtifact(artifact);
    }

    /**
     *
     *
     * @param {Script} script
     * @memberof AssetsRegistry
     */
    public addScript(script: Script): void {
        if (fs.existsSync(script.path)) {
            const filename = `${this.env.assetsScriptsDirectory}/${path.basename(script.path)}`;
            fs.copyFileSync(script.path, filename);

            script.path = filename;
            this.manifest.addScripts(script);
        }
    }

    /**
     *
     *
     * @private
     * @memberof AssetsRegistry
     */
    private createAssetsDirectory(): void {
        fs.mkdirSync(this.env.assetsDirectory);
        fs.mkdirSync(this.env.assetsArtifactsDirectory);
        fs.mkdirSync(this.env.assetsScriptsDirectory);
    }
}
