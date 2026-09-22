// Fix: Reinstall Rollup's Windows Native Binary
In your terminal (Git Bash / PowerShell at project root):

npm install -D @rollup/rollup-win32-x64-msvc


// If it still complains (ERR_DLOPEN_FAILED)
// If the cached binary file is locked or corrupted


//Close any running node instances or extra terminals.  
//  Remove the specific corrupt package folder:

rm -rf node_modules/@rollup/rollup-win32-x64-msvc

//Reinstall with exact platform flags:

npm i -D @rollup/rollup-win32-x64-msvc --no-save
npm run dev