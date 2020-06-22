import os from "os";
import fs, { WriteStream } from "fs-extra";
import path from "path";
import streamProgress from "progress-stream";
import { Service } from "typedi";
import { Artifact } from "../../types/manifest";
import { ProgressCallback } from "../../types/progress";

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
            const snapshot = artifact.path;
            const temp = path.join(os.tmpdir(), path.basename(artifact.path));
            artifact.path = temp;

            const reader = fs.createReadStream(snapshot);
            const writer = fs.createWriteStream(temp);

            let copy: WriteStream;
            if (progress) {
                let prog = streamProgress({
                    length: fs.statSync(snapshot).size,
                });
                prog.on("progress", (data) => {
                    const percent = (data.delta / data.length) * 100;
                    progress(percent);
                });

                copy = reader.pipe(prog).pipe(writer);
            } else {
                copy = reader.pipe(writer);
            }

            return new Promise<Artifact>((resolve, _) => {
                copy.on("close", () => {
                    resolve(artifact);
                });
            });
        }

        return artifact;
    }
}
