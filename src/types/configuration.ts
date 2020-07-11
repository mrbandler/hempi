/**
 * Package URLs.
 *
 * @export
 * @interface Urls
 */
export interface Urls {
    x32: string;
    x64?: string;
    adds?: string[];
}

/**
 * Scripts for the package.
 *
 * @export
 * @interface Scripts
 */
export interface Scripts {
    pre?: string;
    post?: string;
}

/**
 * Packge information.
 *
 * @export
 * @interface Package
 */
export interface Package {
    cmd: string;
    url?: Urls;
    scripts?: Scripts;
}

/**
 * Package map.
 *
 * @export
 * @interface Packages
 */
export interface Packages {
    [name: string]: Package;
}

/**
 * Installer configuration.
 *
 * @export
 * @interface InstallerConfiguration
 */
export interface InstallerConfiguration {
    packages: Packages;
}
