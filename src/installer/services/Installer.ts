import os from "os";
import _ from "lodash";
import Listr from "listr";
import Progress from "progress-string";
import { Service, Inject } from "typedi";
import { Artifact, Script } from "../../types/manifest";
import { Environment } from "./Environment";
import { AssetManifestManager } from "./AssetsManifest";
import { ArtifactsDownloader } from "./ArtifactDownloader";
import { CommandExecutor } from "./CommandExecutor";
import { ScriptExecutor } from "./ScriptExecutor";
import { ArtifactRemover } from "./ArtifactRemover";
import { ArtifactExtractor } from "./ArtifactExtractor";
import { ProgressCallback } from "../../types/progress";

/**
 * Installer context, to be passed in the installation task chain.
 *
 * @interface InstallerContext
 */
interface InstallerContext {
    artifact: Artifact;
    script?: Script;
    didInstall: boolean;
}

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
     * Injected artifacts extractor.
     *
     * @private
     * @type {ArtifactExtractor}
     * @memberof Installer
     */
    @Inject()
    private extractor!: ArtifactExtractor;

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
        const loadingManifestTask: Listr.ListrTask = {
            title: "Loading manifest",
            task: () => {
                this.manifest.load(this.env.assetsManifestPath);
            },
        };

        const installingTask: Listr.ListrTask = {
            title: "Installing packages",
            task: () => {
                const artifacts = this.manifest.getArtifacts();
                const artifactInstallTasks = artifacts.map((a) => this.installArtifact(a));

                return new Listr(artifactInstallTasks, {
                    concurrent: false,
                    exitOnError: false,
                });
            },
        };

        const tasks = new Listr([loadingManifestTask, installingTask]);
        await tasks.run().catch(_.noop);
    }

    /**
     * Installs a given artifact.
     *
     * @private
     * @param {Artifact} artifact Artifact to install
     * @returns {Promise<void>}
     * @memberof Installer
     */
    private installArtifact(artifact: Artifact): Listr.ListrTask<InstallerContext> {
        const downloadTask: Listr.ListrTask<InstallerContext> = {
            title: "Downloading artifact",
            enabled: (ctx) => {
                ctx.artifact = artifact;
                ctx.didInstall = false;
                ctx.script = this.manifest.getScript(ctx.artifact.package);

                return !ctx.artifact.path;
            },
            task: async (ctx, task) => {
                let total = 0;
                let progress = new Progress({ width: 20, total: 100 });
                ctx.artifact = await this.downloadArtifact(ctx.artifact, (percent) => {
                    total = total + percent;
                    task.output = `Downloading [${progress(total)}] ${Math.round(total)}%`;
                });
            },
        };

        const extractTask: Listr.ListrTask<InstallerContext> = {
            title: "Extracting artifact",
            enabled: (ctx) => {
                return ctx.artifact.path ? true : false;
            },
            task: async (ctx, task) => {
                let total = 0;
                let progress = new Progress({ width: 20, total: 100 });
                ctx.artifact = await this.extractor.extract(ctx.artifact, (percent) => {
                    total = total + percent;
                    task.output = `Extracting [${progress(total)}] ${Math.round(total)}%`;
                });
            },
        };

        const installTask: Listr.ListrTask<InstallerContext> = {
            title: "Executing command",
            task: async (ctx, task) => {
                try {
                    task.output = this.commandExecuter.getCommand(ctx.artifact);
                    await this.commandExecuter.exec(ctx.artifact);

                    ctx.didInstall = true;
                } catch (error) {
                    ctx.didInstall = false;

                    throw error;
                }
            },
        };

        const postScriptTask: Listr.ListrTask<InstallerContext> = {
            title: "Running post install script",
            skip: (ctx) => {
                if (ctx.didInstall) {
                    return ctx.script != undefined ? false : "No post install script defined";
                } else {
                    return "Command execution failed";
                }
            },
            task: async (ctx, tasks) => {
                return new Promise<void>((resolve, _) => {
                    if (ctx.script) {
                        tasks.output = this.scriptExecuter.exec(ctx.script);
                        setTimeout(resolve, 1000);
                    }
                });
            },
        };

        const removingArtifactTask: Listr.ListrTask<InstallerContext> = {
            title: "Removing artifact",
            enabled: (ctx) => (ctx.artifact.path ? ctx.artifact.path.includes(os.tmpdir()) : false),
            task: (ctx) =>
                new Promise<void>((resolve, _) => {
                    this.remover.remove(ctx.artifact);
                    setTimeout(resolve, 500);
                }),
        };

        return {
            title: `Installing ${artifact.package}`,
            task: () => {
                return new Listr<InstallerContext>([downloadTask, extractTask, installTask, postScriptTask, removingArtifactTask], {
                    concurrent: false,
                    exitOnError: false,
                });
            },
        };
    }

    /**
     * Downloads a given artifact.
     *
     * @private
     * @param {Artifact} artifact Artifact to download
     * @returns {Promise<Artifact>} Downloaded artifact
     * @memberof Installer
     */
    private async downloadArtifact(artifact: Artifact, progress?: ProgressCallback): Promise<Artifact> {
        if (!artifact.path) {
            artifact.path = await this.downloader.download(`${artifact.package}-${artifact.arch}`, artifact.url, false, progress);
        }

        return artifact;
    }
}