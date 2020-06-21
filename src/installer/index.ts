import "reflect-metadata";
import "./package.json";
import _ from "lodash";
import Container from "typedi";
import { Installer } from "./services/Installer";

/**
 * Custom installer main entry point.
 */
async function main() {
    const installer = Container.get<Installer>(Installer);
    await installer.install();
}

// Calling the main entry point.
main().then(_.noop).catch(_.noop);
