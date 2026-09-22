// Solution 1: Force Rollup to Rebuild/Fetch the Node 22 Binary (Fastest)

npm rebuild @rollup/rollup-win32-x64-msvc

//If it does not automatically re-download the matching Node 
// 22 ABI, remove the mismatched package directory and 
// reinstall with --force so npm doesn't pull the stale cache
//  from your local Artifactory cache:   


rm -rf node_modules/@rollup/rollup-win32-x64-msvc
npm install @rollup/rollup-win32-x64-msvc --force


npm run dev