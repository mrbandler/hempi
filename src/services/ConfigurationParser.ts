import fs from "fs-extra";
import path from "path";
import yml from "yaml";
import Listr from "listr";
import { Service } from "typedi";
import { InstallerConfiguration } from "../types/configuration";

/**
 * Parser context, to be passed along the parsing task chain.
 *
 * @interface ParserContext
 */
interface ParserContext {
    contents: string;
    configuration: InstallerConfiguration;
}

/**
 * Configuration ConfigurationParser.
 *
 * Parses the installer configuration given by a filepath.
 *
 * @export
 * @class ConfigurationParser
 */
@Service()
export class ConfigurationParser {
    /**
     * Parses the configuration by a given filepath.
     *
     * @param {string} filepath Path to the configuration file
     * @returns {InstallerConfiguration} Parsed installer configuration
     * @memberof ConfigurationParser
     */
    public async parse(filepath: string): Promise<InstallerConfiguration> {
        const readTask: Listr.ListrTask<ParserContext> = {
            title: "Reading installer configuration",
            task: (ctx) => {
                ctx.contents = this.read(filepath);
                ctx.configuration = yml.parse(ctx.contents) as InstallerConfiguration;
                ctx.configuration = this.sanitizePaths(filepath, ctx.configuration);
            },
        };

        const tasks = new Listr([readTask]);
        const context = await tasks.run();
        return context.configuration;

        // const contents = this.read(filepath);
        // let result = yml.parse(contents) as InstallerConfiguration;

        // return this.sanitizePaths(filepath, result);
    }

    /**
     * Reads the file contents from a given filepath.
     *
     * @private
     * @param {string} filepath Path to the file, to read the contents from
     * @returns {string} File contents
     * @memberof ConfigurationParser
     */
    private read(filepath: string): string {
        let exists = fs.existsSync(filepath);

        if (exists) {
            return fs.readFileSync(filepath, "utf-8");
        } else {
            throw new Error(`Configuration file '${filepath}' could not be found`);
        }
    }

    /**
     * Sanitizes filepath within the installer configuration.
     *
     * Since all filepaths are expectd to be relative to the installer configuration itself.
     *
     * @private
     * @param {string} filepath Filepath of the installer configuration
     * @param {InstallerConfiguration} configuration Installer configuration to sanitize
     * @returns {InstallerConfiguration} Sanitized installer configuration
     * @memberof ConfigurationConfigurationParser
     */
    private sanitizePaths(filepath: string, configuration: InstallerConfiguration): InstallerConfiguration {
        if (configuration.packages) {
            for (const name in configuration.packages) {
                if (configuration.packages.hasOwnProperty(name)) {
                    const pkg = configuration.packages[name];

                    if (pkg.scripts) {
                        pkg.scripts.pre = pkg.scripts.pre ? path.join(path.dirname(filepath), pkg.scripts.pre) : undefined;
                        pkg.scripts.post = pkg.scripts.post ? path.join(path.dirname(filepath), pkg.scripts.post) : undefined;
                    }
                }
            }
        }

        return configuration;
    }
}
