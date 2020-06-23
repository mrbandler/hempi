import fs, { WriteStream } from "fs-extra";
import path from "path";
import streamProgress from "progress-stream";
import { Service, Inject } from "typedi";
import { Artifact } from "../../types/manifest";
import { ProgressCallback } from "../../types/progress";
import { Environment } from "./Environment";

/**
 * Artifact extractor.
 *
 * Extracts a bundled artifact from the self-contained package.
 *
 * @export
 * @class ArtifactExtractor
 */
@Service()
export class ArtifactExtractor {
    /**
     * Injected environment.
     *
     * @private
     * @type {Environment}
     * @memberof ArtifactExtractor
     */
    @Inject()
    private env!: Environment;

    /**
     * Extracts the given artifact from the self-contained package.
     *
     * Artifact will be extracted to the OS's temp directory.
     * The "path" attribute of the artifact will be changed.
     *
     * @param {Artifact} artifact Artifact to extract
     * @returns {Promise<Artifact>} Extracted artifact
     * @memberof ArtifactExtractor
     */
    public async extract(artifact: Artifact, progress?: ProgressCallback): Promise<Artifact> {
        if (artifact.path) {
            const archivePath = artifact.path;
            const filepath = path.join(this.env.osTempDirectory, path.basename(artifact.path));
            artifact.path = filepath;

            await this.copyFromArchive(archivePath, filepath, progress);

            if (artifact.adds) {
                for (let i = 0; i < artifact.adds.length; i++) {
                    const add = artifact.adds[i];
                    const filepath = path.join(this.env.osTempDirectory, path.basename(add));
                    console.log(filepath);
                    await this.copyFromArchive(add, filepath, progress);

                    artifact.adds[i] = filepath;
                }
            }
        }

        return artifact;
    }

    /**
     * Copyies a file from the bundled archive to the host system.
     *
     * @private
     * @param {string} archivePath Archive path
     * @param {string} filepath Filepath to copy to on the host system
     * @param {ProgressCallback} [progress] Progress callback
     * @returns {Promise<void>}
     * @memberof ArtifactExtractor
     */
    private async copyFromArchive(archivePath: string, filepath: string, progress?: ProgressCallback): Promise<void> {
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        const reader = fs.createReadStream(archivePath);
        const writer = fs.createWriteStream(filepath);

        let copy: WriteStream;
        if (progress) {
            let prog = streamProgress({
                length: fs.statSync(archivePath).size,
            });
            prog.on("progress", (data) => {
                const percent = (data.delta / data.length) * 100;
                progress(percent);
            });

            copy = reader.pipe(prog).pipe(writer);
        } else {
            copy = reader.pipe(writer);
        }

        return new Promise<void>((resolve, reject) => {
            copy.on("error", reject);
            copy.on("close", () => {
                resolve();
            });
        });
    }
}
