Subject: Urgent Request: Whitelist Angular 18 Packages in Artifactory npm-teamdev Proxy
Dear Citi DevOps / Artifactory Team,
We are upgrading our Angular application to Angular 18 (stable 18.2.x).
Current Situation:

Angular 18 installs and runs perfectly on personal machines (direct from public npm registry).
In Citi environment (using Artifactory proxy: https://www.artifactrepository.citigroup.net/artifactory/api/npm/npm-teamdev/), installation fails due to missing or outdated packages.
Angular 17 and earlier work fine as their dependencies are already mirrored.

What Needs to Be Whitelisted/Updated:
Please mirror and whitelist the following in the npm-teamdev proxy:

All @angular/* packages at version ~18.2.0 (including core, common, compiler, forms, router, animations, platform-browser, etc.)
@angular-devkit/* packages at ~18.2.0
@angular/cli and @angular/compiler-cli at ~18.2.0
Transitive dependencies, especially optional native binaries like:
@rollup/rollup-win32-x64-msvc
esbuild and related platform-specific packages


Once these are available, we can successfully run pnpm install (or npm) for Angular 18 projects in the Citi environment.
Please let me know if you need the full package.json or specific version ranges. Thank you for your quick assistance!

Best regards,
Sudhanshu Jain