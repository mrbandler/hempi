import "reflect-metadata";
import _ from "lodash";
import pkg from "../package.json";
import commander from "commander";
import Container from "typedi";
import { Options } from "./types/options";
import { InstallerBuilder } from "./services/InstallerBuilder";

/**
 * CLI main entry point.
 */
async function main() {
    const cli = new commander.Command();
    cli.version(pkg.version)
        .description("Hempi - Highly Elaborate Multi-Package Installer | CLI to create custom installers for windows based systems")
        .option("-c, --config <config.yml>", "Installer configuration")
        .option("-o, --output <installer.exe>", "Output path for the custom installer", "./hempi.exe")
        .option("-d, --download", "Whether the installers should be downloaded for a custom offline installer", false)
        .parse(process.argv);

    if (!process.argv.slice(2).length) {
        cli.outputHelp();
    } else {
        const options = cli.opts() as Options;

        const builder = Container.get<InstallerBuilder>(InstallerBuilder);
        await builder.build(options);
    }
}

// Calling the main entry point.
main().then(_.noop).catch(_.noop);
