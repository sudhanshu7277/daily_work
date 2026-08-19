"optionalDependencies": {
    "@rollup/rollup-win32-x64-msvc": "^4.28.1"
  }

  // Solution 1: Use the WebAssembly Fallback (1-Shot Local Fix)
//Force Rollup to bypass the native C++ Windows binary and run the WASM v
// ersion directly by setting the environment variable in your terminal:

ROLLUP_NO_NATIVE=true npm run build

// To make this permanent in your library's package.json, update the "build" script:

"scripts": {
  "build": "cross-env ROLLUP_NO_NATIVE=true vite build",
  "typecheck": "tsc --noEmit",
  ...
}

//Solution 2: Pin @rollup/rollup-win32-x64-msvc and vite to Node 22 Supported Versions
//Update package.json with the patched Rollup binaries:

//Update your dependencies in package.json:


"devDependencies": {
    ...
    "vite": "^6.1.1",
    "@rollup/rollup-win32-x64-msvc": "^4.34.8"
  },
  "optionalDependencies": {
    "@rollup/rollup-win32-x64-msvc": "^4.34.8"
  }


  npm install
npm run build


// Quick Verification
Execute in your Git Bash terminal:


ROLLUP_NO_NATIVE=true npx vite build