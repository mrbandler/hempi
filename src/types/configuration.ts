/**
 * Package URLs.
 *
 * @export
 * @interface Urls
 */
export interface Urls {
    x32: string;
    x64?: string;
}

/**
 * Packge information.
 *
 * @export
 * @interface Package
 */
export interface Package {
    url: Urls;
    cmd?: string;
    script?: string;
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
