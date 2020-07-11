import { Service, Inject } from "typedi";
import { Options } from "../types/options";
import { ConfigurationParser } from "./ConfigurationParser";
import { InstallerPackager } from "./InstallerPackager";
import { InstallerConfigurator } from "./InstallerConfigurator";
import { Environment } from "../installer/services/Environment";

/**
 * Installer builder.
 *
 * Builds the custom installer based on the given CLI options.
 * This is also the main entry point of the CLI after the main() function in the index.ts
 *
 * @export
 * @class InstallerBuilder
 */
@Service()
export class InstallerBuilder {
    /**
     * Injected environment.
     *
     * @private
     * @type {Environment}
     * @memberof InstallerBuilder
     */
    @Inject()
    private env!: Environment;

    /**
     * Injected configuration parser.
     *
     * @private
     * @type {ConfigurationParser}
     * @memberof InstallerBuilder
     */
    @Inject()
    private parser!: ConfigurationParser;

    /**
     * Injected custom installer packager.
     *
     * @private
     * @type {InstallerPackager}
     * @memberof InstallerBuilder
     */
    @Inject()
    private packager!: InstallerPackager;

    /**
     * Injected custom installer configurator.
     *
     * @private
     * @type {InstallerConfigurator}
     * @memberof InstallerBuilder
     */
    @Inject()
    private configurator!: InstallerConfigurator;

    /**
     * Builds a custom installer based on the give CLI options.
     *
     * @param {Options} options CLI options
     * @returns {Promise<void>}
     * @memberof InstallerBuilder
     */
    public async build(options: Options): Promise<void> {
        this.env.disableStrictSSL = options.disableStrictSsl;

        const configuration = await this.parser.parse(options.config);
        const configured = await this.configurator.configure(configuration, options.download);
        if (configured) {
            await this.packager.package(options.output);
        }
    }
}
