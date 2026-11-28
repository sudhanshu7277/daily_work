"overrides": {
    "@babel/helper-module-transforms": "7.28.6"
  }


  //Open your terminal in payment-flow-ui-lib and run:

  npm view @babel/helper-module-transforms versions --json


  //Verify 7.28.6 against the CI registry so you don't hit another ETARGET:

  npm view @babel/helper-module-transforms@7.28.6 version --registry=https://npm-ear-prod-swdc.ls.dyn.nsroot.net/artifactory/api/npm/npm-enterprise-icma/


  //Instead of playing whack-a-mole one package at a time, pin 
  // @babel/core and all @babel/* 7.29.x packages in "overrides" in 
  // package.json to "7.28.6" (or "7.28.5" for packages whose 7.28 release
  //  stopped at 7.28.5—pinning "@babel/core": "7.28.6" + the ^7.29.7 sub-packages 
  // from package-lock.json prevents npm from ever requesting ^7.29.16):

  "overrides": {
    "@babel/core": "7.28.6",
    "@babel/code-frame": "7.28.6",
    "@babel/generator": "7.28.6",
    "@babel/helper-compilation-targets": "7.28.6",
    "@babel/helper-module-transforms": "7.28.6",
    "@babel/helpers": "7.28.6",
    "@babel/parser": "7.28.6",
    "@babel/template": "7.28.6",
    "@babel/traverse": "7.28.6",
    "@babel/types": "7.28.6"
  }


  //

  git add package.json
git commit -m "IS-86441: pin @babel 7.28.6 packages in overrides"
git push