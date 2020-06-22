import _ from "lodash";
import Listr from "listr";
import Progress from "progress-string";
import { Service, Inject } from "typedi";
import { InstallerConfiguration, Packages, Package } from "../types/configuration";
import { AssetRegistry } from "./AssetsRegistry";
import { Artifact, Script, Arch } from "../types/manifest";

/**
 * Configurator context, to be passed along the configuration task chain.
 *
 * @interface ConfiguratorContext
 */
interface ConfiguratorContext {
    success: boolean;
}

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
    public async configure(configuration: InstallerConfiguration, download?: boolean): Promise<boolean> {
        if (configuration.packages) {
            const initRegistryTask: Listr.ListrTask<ConfiguratorContext> = {
                title: "Initializing package registry",
                task: () => {
                    this.registry.initAssetsDirectory();

                    return new Listr(this.registerPackages(configuration.packages, download), {
                        exitOnError: true,
                        concurrent: true,
                    });
                },
            };

            const saveManifestTask: Listr.ListrTask<ConfiguratorContext> = {
                title: "Persisting registry manifest",
                enabled: (ctx) => ctx.success === true,
                task: () => {
                    this.registry.saveManifest();
                },
            };

            const tasks = new Listr([initRegistryTask, saveManifestTask]);
            const context = await tasks.run();

            return context.success;
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
    private registerPackages(packages: Packages, download?: boolean): Listr.ListrTask<ConfiguratorContext>[] {
        let result: Listr.ListrTask[] = [];

        for (const name in packages) {
            if (packages.hasOwnProperty(name)) {
                const pkg = packages[name] as Package;

                const registerPackageTask: Listr.ListrTask<ConfiguratorContext> = {
                    title: `Registering ${name}`,
                    task: async (ctx, task) => {
                        if (this.isPackageValid(pkg)) {
                            const artifacts = this.createArtifacts(name, pkg);
                            for (const artifact of artifacts) {
                                let total = 0;
                                let progress = new Progress({ width: 20, total: 100 });
                                await this.registry.addArtifact(artifact, download, (percent) => {
                                    total = total + percent;
                                    task.output = `Downloading [${progress(total)}] ${Math.round(total)}%`;
                                });
                            }

                            const script = this.createScript(name, pkg);
                            if (script) {
                                this.registry.addScript(script);
                            }

                            ctx.success = true;
                        } else {
                            throw new Error(`Unable to register package ${pkg}, its definition is invalid`);
                        }
                    },
                };

                result.push(registerPackageTask);
            }
        }

        return result;
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
