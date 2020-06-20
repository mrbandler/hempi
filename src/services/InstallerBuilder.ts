import { Service, Inject } from "typedi";
import { Options } from "../types/options";
import { ConfigurationParser } from "./ConfigurationParser";
import { InstallerPackager } from "./InstallerPackager";

/**
 * Builder service.
 *
 * Builds the custom installer based on the given CLI options.
 *
 * @export
 * @class Builder
 */
@Service()
export class InstallerBuilder {
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
     * Builds a custom installer based on the give CLI options.
     *
     * @param {Options} options CLI options
     * @returns {Promise<void>}
     * @memberof Builder
     */
    public async build(options: Options): Promise<void> {
        const configuration = this.parser.parse(options.config);

        // TODO: Read the configuration and either pre-download all installers and put them in the assets folder
        // TODO: OR inject the data into the custom installer to download the installers on the fly.

        this.packager.package(options.output);
    }
}
