import esbuild from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const projects = [
    "mom",
    "credit-statement-export",
    // more to come
];

const root = path.dirname(fileURLToPath(import.meta.url));
for (const project of projects) {
    await esbuild.build({
        entryPoints: [path.join(root, project, "src/index.ts")],
        bundle: true,
        // minify: true,
        format: "esm",
        outfile: path.join(root, project, "dist/bundle.js"),
    });
}
