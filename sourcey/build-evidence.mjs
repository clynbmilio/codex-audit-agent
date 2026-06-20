import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

const root = resolve(import.meta.dirname);
const outputDir = resolve(root, process.argv[2] ?? "dist");
const specText = await readFile(resolve(root, "immich-openapi-specs.json"), "utf8");
const spec = JSON.parse(specText);
const searchIndex = JSON.parse(await readFile(resolve(outputDir, "search-index.json"), "utf8"));
const baseUrl = "https://versy-docs.rweb.site";
const endpoints = searchIndex.filter((entry) => entry.category === "Endpoints");

if (endpoints.length < 20) {
  throw new Error(`Expected at least 20 documented endpoints, found ${endpoints.length}`);
}

const evidence = {
  schema_version: "1.0",
  library: {
    name: "Immich",
    version: spec.info.version,
    source_repo: "https://github.com/immich-app/immich",
    source_commit: "b24a61714220a0c3999f4c24419b71472ee070c5",
    source_commit_url:
      "https://github.com/immich-app/immich/commit/b24a61714220a0c3999f4c24419b71472ee070c5",
    source_spec_path: "open-api/immich-openapi-specs.json",
    source_spec_url:
      "https://raw.githubusercontent.com/immich-app/immich/b24a61714220a0c3999f4c24419b71472ee070c5/open-api/immich-openapi-specs.json",
    source_spec_sha256: createHash("sha256").update(specText).digest("hex"),
  },
  generator: {
    name: "Sourcey",
    version: "3.6.3",
    adapter: "OpenAPI",
    command: "npx --yes sourcey@3.6.3 build --config sourcey.config.ts --output dist",
  },
  site: {
    canonical_url: baseUrl,
    preview_url: "https://wewwwwww.netlify.app",
    api_reference_url: `${baseUrl}/api.html`,
    evidence_url: `${baseUrl}/evidence.json`,
    note: "Community-generated reference built from Immich's public OpenAPI specification; not an official Immich deployment.",
  },
  coverage: {
    documented_endpoints: endpoints.length,
    documented_schemas: Object.keys(spec.components?.schemas ?? {}).length,
    search_entries: searchIndex.length,
    minimum_required_endpoints: 20,
  },
  pages: endpoints.map((entry) => ({
    title: entry.title,
    method: entry.method.toUpperCase(),
    path: entry.path,
    url: `${baseUrl}${entry.url}`,
  })),
};

await writeFile(resolve(outputDir, "evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(
  `Wrote evidence.json with ${evidence.coverage.documented_endpoints} endpoint pages and ${evidence.coverage.documented_schemas} schemas.`,
);
