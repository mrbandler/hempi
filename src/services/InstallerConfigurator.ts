import _ from "lodash";
import { Service, Inject } from "typedi";
import { InstallerConfiguration, Packages, Package } from "../types/configuration";
import { AssetRegistry } from "./AssetsRegistry";
import { Artifact, Script, Arch } from "../types/manifest";

/**
 * Installer configurator.
 *
 * Given a installer configuration the configurator will configure the custom installer.
 * That mainly includes setting up the asset registry and the corresponding manifest.
 *
 * @export
 * @class InstallerConfigurator
 */
@Service()
export class InstallerConfigurator {
    /**
     * Injected asset registry.
     *
     * @private
     * @type {AssetRegistry}
     * @memberof InstallerConfigurator
     */
    @Inject()
    private registry!: AssetRegistry;

    /**
     * Configures a custom installer based on a given installer configuration.
     *
     * @param {InstallerConfiguration} configuration Installer configuration to configure
     * @returns {Promise<void>}
     * @memberof InstallerConfigurator
     */
    public async configure(configuration: InstallerConfiguration, download?: boolean): Promise<void> {
        if (configuration.packages) {
            await this.createRegistry(configuration.packages, download);
        } else {
            throw new Error("Unable to configure custom installer, no packages defined");
        }
    }

    /**
     * Creates the registry based on all packages within a installer configuration.
     *
     * @private
     * @param {Packages} packages Packages to register within the asset registry
     * @param {boolean} [download] Flag, whether the packages should be downloaded for a offline installer
     * @returns {Promise<void>}
     * @memberof InstallerConfigurator
     */
    private async createRegistry(packages: Packages, download?: boolean): Promise<void> {
        this.registry.initAssetsDirectory();

        let success = false;
        for (const name in packages) {
            if (packages.hasOwnProperty(name)) {
                const pkg = packages[name] as Package;

                if (this.isPackageValid(pkg)) {
                    const artifacts = this.createArtifacts(name, pkg);
                    for (const artifact of artifacts) {
                        await this.registry.addArtifact(artifact, download);
                    }

                    const script = this.createScript(name, pkg);
                    if (script) {
                        this.registry.addScript(script);
                    }

                    success = true;
                } else {
                    //TODO: Message to the user.
                }
            }
        }

        if (success) {
            this.registry.saveManifest();
        }
    }

    /**
     * Creates a package artifact for the asset registry.
     *
     * @private
     * @param {string} name Name of the package
     * @param {Package} pkg Package data
     * @returns {Artifact[]} Created artifacts
     * @memberof InstallerConfigurator
     */
    private createArtifacts(name: string, pkg: Package): Artifact[] {
        let result: Artifact[] = [];

        result.push({
            package: name,
            arch: Arch.x32,
            url: pkg.url.x32,
            cmd: pkg.cmd,
        });

        if (pkg.url.x64) {
            result.push({
                package: name,
                arch: Arch.x64,
                url: pkg.url.x64,
                cmd: pkg.cmd,
            });
        }

        return result;
    }

    /**
     * Creates a post install script for the asset registry.
     *
     * @private
     * @param {string} name Name of the package
     * @param {Package} pkg Package data
     * @returns {(Script | undefined)} Created script (can be undefined when package has no post install script associated)
     * @memberof InstallerConfigurator
     */
    private createScript(name: string, pkg: Package): Script | undefined {
        return pkg.script
            ? {
                  package: name,
                  path: pkg.script,
              }
            : undefined;
    }

    /**
     * Checks whether a given package is valid or not.
     *
     * @private
     * @param {Package} pkg Package to check
     * @returns {boolean} Flag, whehter the package is valid or not
     * @memberof InstallerConfigurator
     */
    private isPackageValid(pkg: Package): boolean {
        return !_.isNull(pkg.url.x32);
    }
}
