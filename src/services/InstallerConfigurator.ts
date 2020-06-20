import { Service, Inject } from "typedi";
import { InstallerConfiguration } from "../types/configuration";

/**
 *
 *
 * @export
 * @class InstallerConfigurator
 */
@Service()
export class InstallerConfigurator {
    /**
     *
     *
     * @param {InstallerConfiguration} configuration
     * @returns {Promise<void>}
     * @memberof InstallerConfigurator
     */
    public async configure(configuration: InstallerConfiguration): Promise<void> {}
}
