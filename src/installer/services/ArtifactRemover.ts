import fs from "fs-extra";
import { Service } from "typedi";
import { Artifact } from "../../types/manifest";

/**
 * Artifact remover.
 *
 * @export
 * @class ArtifactRemover
 */
@Service()
export class ArtifactRemover {
    /**
     * Removes the corresponding file in the OS temp directory for a given artifact.
     *
     * @param {Artifact} artifact Artifcat to remove from OS temp directory
     * @memberof ArtifactRemover
     */
    public remove(artifact: Artifact): void {
        if (artifact.path && fs.existsSync(artifact.path)) {
            fs.unlinkSync(artifact.path);
        }

        if (artifact.adds) {
            for (const add of artifact.adds) {
                if (fs.existsSync(add)) {
                    fs.unlinkSync(add);
                }
            }
        }
    }
}
