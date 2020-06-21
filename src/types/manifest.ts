/**
 * CPU architecture.
 *
 * @export
 * @enum {number}
 */
export enum Arch {
    x32 = "x32",
    x64 = "x64",
}

/**
 * Package artifact.
 *
 * @export
 * @interface Artifact
 */
export interface Artifact {
    package: string;
    arch: Arch;
    url: string;
    cmd?: string;
    path?: string;
}

/**
 * Artifact post install script.
 *
 * @export
 * @interface Script
 */
export interface Script {
    package: string;
    path: string;
}

/**
 * Asset manifest.
 *
 * @export
 * @interface AssetsManifest
 */
export interface AssetsManifest {
    artifacts: Artifact[];
    scripts: Script[];
}
