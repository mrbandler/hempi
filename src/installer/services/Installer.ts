import { Service, Inject } from "typedi";
import { Artifact } from "../../types/manifest";
import { Environment } from "./Environment";
import { AssetManifestManager } from "./AssetsManifest";
import { ArtifactsDownloader } from "./ArtifactDownloader";
import { CommandExecutor } from "./CommandExecutor";
import { ScriptExecutor } from "./ScriptExecutor";
import { ArtifactRemover } from "./ArtifactRemover";

/**
 * Installer.
 *
 * This is the main entry point of every custom installer after the main() function in the index.ts.
 *
 * @export
 * @class Installer
 */
@Service()
export class Installer {
    /**
     * Injected environment.
     *
     * @private
     * @type {Environment}
     * @memberof Installer
     */
    @Inject()
    private env!: Environment;

    /**
     * Inject asset manifest manager.
     *
     * @private
     * @type {AssetManifestManager}
     * @memberof Installer
     */
    @Inject()
    private manifest!: AssetManifestManager;

    /**
     * Injected artifacts downloader.
     *
     * @private
     * @type {ArtifactsDownloader}
     * @memberof Installer
     */
    @Inject()
    private downloader!: ArtifactsDownloader;

    /**
     * Injected command executer.
     *
     * @private
     * @type {CommandExecutor}
     * @memberof Installer
     */
    @Inject()
    private commandExecuter!: CommandExecutor;

    /**
     * Injected script executer.
     *
     * @private
     * @type {ScriptExecutor}
     * @memberof Installer
     */
    @Inject()
    private scriptExecuter!: ScriptExecutor;

    /**
     * Injected artifact remover.
     *
     * @private
     * @type {ArtifactRemover}
     * @memberof Installer
     */
    @Inject()
    private remover!: ArtifactRemover;

    /**
     * Kicks of the installation process.
     *
     * @returns {Promise<void>}
     * @memberof Installer
     */
    public async install(): Promise<void> {
        this.manifest.load(this.env.assetsManifestPath);

        const artifacts = this.manifest.getArtifacts();
        for (const artifact of artifacts) {
            await this.installArtifact(artifact);
        }
    }

    /**
     * Installs a given artifact.
     *
     * @private
     * @param {Artifact} artifact Artifact to install
     * @returns {Promise<void>}
     * @memberof Installer
     */
    private async installArtifact(artifact: Artifact): Promise<void> {
        artifact = await this.downloadArtifact(artifact);

        try {
            await this.commandExecuter.exec(artifact);
        } catch (error) {
            console.error(error.message);
        }

        const script = this.manifest.getScript(artifact.package);
        if (script) {
            await this.scriptExecuter.exec(script);
        }

        this.remover.remove(artifact);
    }

    /**
     * Downloads a given artifact.
     *
     * @private
     * @param {Artifact} artifact Artifact to download
     * @returns {Promise<Artifact>} Downloaded artifact
     * @memberof Installer
     */
    private async downloadArtifact(artifact: Artifact): Promise<Artifact> {
        if (!artifact.path) {
            artifact.path = await this.downloader.download(`${artifact.package}-${artifact.arch}`, artifact.url);
        }

        return artifact;
    }
}
