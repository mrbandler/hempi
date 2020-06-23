import fs from "fs-extra";
import path from "path";
import https from "https";
import axios from "axios";
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
        const basepath = toRegistry ? this.env.assetsArtifactsDirectory : this.env.osTempDirectory;
        const ext = this.getFileExtension(url);
        const filepath = path.join(basepath, `${filename}${ext}`);

        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

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

        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);

        if (progress) {
            const total = parseInt(response.headers["content-length"]);
            response.data.on("data", (chunk: Buffer) => {
                const percent = (chunk.length / total) * 100;
                progress(percent);
            });
        }

        return new Promise<string>((resolve, reject) => {
            writer.on("error", (error) => reject(error));
            writer.on("close", () => {
                resolve(filepath);
            });
        });
    }

    /**
     * Returns the file extension based on the URL and the content type.
     *
     * @private
     * @param {string} url URL of the file to download
     * @param {string} contentType Content type of the file to download
     * @returns {string} File extension
     * @memberof ArtifactsDownloader
     */
    private getFileExtension(url: string): string {
        let result = ".exe";

        const ext = path.extname(url);
        if (ext !== "") {
            result = ext;
        }

        return result;
    }
}
