import os from "os";
import fs from "fs-extra";
import path from "path";
import https from "https";
import axios from "axios";
import mime from "mime-types";
import { Service, Inject } from "typedi";
import { Environment } from "./Environment";
import { ProgressCallback } from "../../types/progress";

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
    public async download(filename: string, url: string, toRegistry?: boolean, progress?: ProgressCallback): Promise<string> {
        const clientConfig = this.env.disableStrictSSL
            ? {
                  httpsAgent: new https.Agent({
                      rejectUnauthorized: false,
                  }),
              }
            : {};

        const client = axios.create(clientConfig);
        const response = await client.get(url, {
            responseType: "stream",
        });

        if (progress) {
            const total = parseInt(response.headers["content-length"]);
            response.data.on("data", (chunk: Buffer) => {
                const percent = (chunk.length / total) * 100;
                progress(percent);
            });
        }

        return new Promise<string>((resolve, reject) => {
            const basepath = toRegistry ? this.env.assetsArtifactsDirectory : os.tmpdir();
            const ext = mime.extension(response.headers["content-type"]) ? mime.extension(response.headers["content-type"]) : "exe";
            const filepath = path.join(basepath, `${filename}.${ext}`);
            const writer = fs.createWriteStream(filepath);

            response.data.pipe(writer);
            writer.on("error", (error) => reject(error));
            writer.on("close", () => {
                resolve(filepath);
            });
        });
    }
}
