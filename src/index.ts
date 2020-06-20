import { exec } from "pkg";

async function build(): Promise<void> {
    await exec([`${__dirname}/installer`, "-o", "hepi"]);
}

build()
    .then(() => console.log("Build done!"))
    .catch((error: Error) => console.error(error.message));
