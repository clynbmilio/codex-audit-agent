import { defineConfig, openapi } from "sourcey";

export default defineConfig({
  name: "Immich API Reference",
  siteUrl: "https://versy-docs.rweb.site",
  repo: "https://github.com/immich-app/immich",
  theme: {
    preset: "api-first",
    colors: {
      primary: "#0f766e",
      light: "#14b8a6",
      dark: "#115e59",
    },
  },
  codeSamples: ["curl", "javascript", "python", "go"],
  navbar: {
    links: [
      {
        type: "github",
        label: "Immich source",
        href: "https://github.com/immich-app/immich",
      },
      {
        type: "link",
        label: "Build evidence",
        href: "/evidence.json",
      },
    ],
    primary: {
      type: "button",
      label: "Official Immich Docs",
      href: "https://docs.immich.app/",
    },
  },
  navigation: {
    tabs: [
      {
        tab: "API Reference",
        slug: "api",
        source: openapi("./immich-openapi-specs.json"),
      },
    ],
  },
});
