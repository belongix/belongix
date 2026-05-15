const fs=require('fs');
const c=fs.readFileSync('screens/DashboardScreen.tsx','utf8');
const lines=c.split('\n');
lines.forEach(function(l,i){if(l.indexOf('tab:')>-1){console.log(i+1,l.trim());}});