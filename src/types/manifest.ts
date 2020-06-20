export enum Arch {
    x32,
    x64,
}

export interface Artifact {
    package: string;
    arch: Arch;
    cmd: string;
    url: string;
    path?: string;
}

export interface Script {
    package: string;
    path: string;
}

export interface AssetsManifest {
    artifacts: Artifact[];
    scripts: Script[];
}
