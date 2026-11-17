# 1. Remove the blocked native MSVC folder and copy the WASM build into its place (or replace rollup/dist)
rm -rf node_modules/@rollup/rollup-win32-x64-msvc
cp -r node_modules/@rollup/wasm-node node_modules/@rollup/rollup-win32-x64-msvc

# 2. Run the dev server
npm run dev