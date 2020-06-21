import axios from "axios";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { Service, Inject } from "typedi";
import { Environment } from "./Environment";

/**
 * Artifact downloader.
 *
 * @export
 * @class ArtifactsDownloader
 */
@Service()
export class ArtifactsDownloader {
    /**
     * Injected environment.
     *
     * @private
     * @type {Environment}
     * @memberof ArtifactsDownloader
     */
    @Inject()
    private env!: Environment;

    /**
     * Downloads a artifact given its URL.
     *
     * @param {string} filename Name of the file to write to
     * @param {string} url URL to download from
     * @param {boolean} [toRegistry] Flag, whether to download to the registry or the OS temp directory
     * @returns {Promise<string>}
     * @memberof ArtifactsDownloader
     */
    public async download(filename: string, url: string, toRegistry?: boolean): Promise<string> {
        const response = await axios.get(url, {
            responseType: "stream",
        });

        return new Promise<string>((resolve, reject) => {
            const basepath = toRegistry ? this.env.assetsArtifactsDirectory : os.tmpdir();
            const filepath = path.join(basepath, `${filename}.exe`);
            const writer = fs.createWriteStream(filepath);
            response.data.pipe(writer);

            writer.on("error", (error) => reject(error));
            writer.on("finish", () => {
                if (toRegistry) {
                    resolve(filepath);
                } else {
                    writer.close();
                    setTimeout(() => resolve(filepath), 500);
                }
            });
        });
    }
}
