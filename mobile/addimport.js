const fs=require('fs'); 
let c=fs.readFileSync('screens/DashboardScreen.tsx','utf8'); 
c=c.replace("from '../lib/theme';","from '../lib/theme';\nimport { navigationRef } from '../lib/navigationRef';"); 
fs.writeFileSync('screens/DashboardScreen.tsx',c,'utf8'); 
console.log('Done'); 
