import "reflect-metadata";
import * as _ from "./package.json";
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
main()
    .then(() => console.log("Installation successfull!"))
    .catch((error: Error) => console.error(error.message));
