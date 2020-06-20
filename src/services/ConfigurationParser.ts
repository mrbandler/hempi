import fs from "fs-extra";
import yml from "yaml";
import { Service } from "typedi";
import { InstallerConfiguration } from "../types/configuration";

/**
 * Configuration parser.
 *
 * @export
 * @class Parser
 */
@Service()
export class ConfigurationParser {
    /**
     * Parses the configuration by a given file path.
     *
     * @param {string} path Path to the configuration file
     * @returns {InstallerConfiguration} Parsed installed configuration
     * @memberof Parser
     */
    public parse(path: string): InstallerConfiguration {
        const contents = this.read(path);
        return yml.parse(contents) as InstallerConfiguration;
    }

    /**
     * Reads the file contents from a given path.
     *
     * @private
     * @param {string} path Path to the file, to read the contents from
     * @returns {string} Read contents
     * @memberof Parser
     */
    private read(path: string): string {
        let exists = fs.existsSync(path);

        if (exists) {
            return fs.readFileSync(path, "utf-8");
        } else {
            throw new Error(`Configuration file '${path}' could not be found`);
        }
    }
}
