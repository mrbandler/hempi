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
 * Additional artifact data.
 *
 * @export
 * @interface Add
 */
export interface Add {
    url: string;
    path?: string;
}

/**
 * Package artifact.
 *
 * @export
 * @interface Artifact
 */
export interface Artifact {
    package: string;
    cmd: string;
    url?: string;
    adds?: Add[];
    arch?: Arch;
    path?: string;
}

/**
 * Script type.
 *
 * @export
 * @enum {number}
 */
export enum ScriptType {
    Pre = "Pre",
    Post = "Post",
}

/**
 * Artifact post install script.
 *
 * @export
 * @interface Script
 */
export interface Script {
    package: string;
    type: ScriptType;
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
    disableStrictSSL: boolean;
}
