export interface Urls {
    x32: string;
    x64?: string;
}

export interface Package {
    urls: Urls;
    cmd: string;
    script?: string;
}

export interface Packages {
    [name: string]: Package;
}

export interface InstallerConfiguration {
    packages: Packages;
}
