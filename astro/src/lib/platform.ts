export const PLATFORM_CONSTRAINTS = {
  siteUrl: "https://toolbite.org",
staticOutput: true,
  preserveAssetPaths: ["/assets/js/", "/assets/css/", "/assets/images/", "/assets/fonts/"],
  preserveDataPaths: ["/data/tools.json"]
} as const;

export const MIGRATION_GUARDS = {
  preserveToolScriptsDirectory: "/assets/js/tools/",
  preservePublicUrls: true,
  preserveGithubPages: true,
  preserveSeoSignals: true
} as const;
